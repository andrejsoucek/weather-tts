import { Gpio } from 'onoff';
import { inject, injectable } from 'inversify';
import { WeatherProvider } from '../weather/WeatherProvider';
import { logger } from '../logger/Logger';
import { Config } from '../config/Config';
import { Synthesizer } from '../tts/Synthesizer';
import { Trigger } from './Trigger';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class GPIOTrigger implements Trigger {
  private working = false;

  private tries = 0;

  constructor(
      @inject(INVERSIFY_TYPES.WeatherProvider) private readonly weatherProvider: WeatherProvider,
      @inject(INVERSIFY_TYPES.Synthesizer) private readonly synthesizer: Synthesizer,
      @inject(INVERSIFY_TYPES.GpioInput) private readonly trigger: Gpio,
      @inject(INVERSIFY_TYPES.GpioOutput) private readonly ptt: Gpio,
  ) {
    process.on('SIGINT', () => {
      this.ptt.unexport();
      this.trigger.unexport();
    });
  }

  listen(config: Config): void {
    logger.info(`GPIO trigger running. Waiting for input on GPIO ${config.gpio.input}`);
    this.trigger.watch((err, value) => {
      logger.info(`Received signal: ${value}`);
      if (err) {
        logger.error(err);
      }
      this.talk(config);
    });
  }

  unlisten(): void {
    this.trigger.unwatchAll();
  }

  private async talk(config: Config): Promise<void> {
    if (this.working) {
      return;
    }
    this.working = true;
    try {
      const weather = await this.weatherProvider.getCurrentWeather(config.realtime.url);
      this.ptt.writeSync(1);
      logger.debug(`PTT start: GPIO value: ${this.ptt.readSync()}`);
      await this.synthesizer.synthesizeAndPlay(weather, config);
      this.tries = 0;
    } catch (err) {
      logger.error(err);
      this.working = false;
      this.ptt.writeSync(0);
      logger.debug(`PTT stop because of error. GPIO value: ${this.ptt.readSync()}`);
      this.tryAgain(config);
    } finally {
      this.working = false;
      this.ptt.writeSync(0);
      logger.debug(`PTT stop. GPIO value: ${this.ptt.readSync()}`);
    }
  }

  private tryAgain(config: Config): void {
    logger.info('Failed talk(). Trying again.');
    if (this.tries < 3) {
      this.tries += 1;
      setTimeout(() => {
        this.talk(config);
      }, 750);
    } else {
      this.ptt.unexport();
      this.trigger.unexport();
      process.exit();
    }
  }
}
