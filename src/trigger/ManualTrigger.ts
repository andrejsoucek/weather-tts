import { WeatherProvider } from '../weather/WeatherProvider';
import { Config } from '../config/Config';
import { logger } from '../logger/Logger';
import { Synthesizer } from '../tts/Synthesizer';
import { Trigger } from './Trigger';

export class ManualTrigger implements Trigger {
    private working = false;

    private tries = 0;

    private stdinListener: NodeJS.ReadStream | undefined;

    constructor(
        private readonly weatherProvider: WeatherProvider,
    ) {
    }

    listen(config: Config): void {
      logger.info('Manual trigger running. Press enter to pull the trigger.');
      this.stdinListener = process.stdin.on('data', () => {
        this.talk(config);
      });
    }

    unlisten(): void {
      if (this.stdinListener) {
        this.stdinListener.removeAllListeners();
      }
    }

    private async talk(config: Config): Promise<void> {
      if (this.working) {
        return;
      }
      this.working = true;
      try {
        const weather = await this.weatherProvider.getCurrentWeather(config.realtime.url);
        await Synthesizer.synthesizeAndPlay(weather, config);
        this.tries = 0;
      } catch (err) {
        logger.error(err);
        this.working = false;
        this.tryAgain(config);
      } finally {
        this.working = false;
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
        process.exit();
      }
    }
}
