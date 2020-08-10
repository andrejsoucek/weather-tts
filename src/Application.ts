import path from 'path';
import axios from 'axios';
import { Gpio } from 'onoff';
import { Config } from './config/Config';
import { Weather } from './parser/Weather';
import { Message } from './message/Message';
import { Synthesizer } from './tts/Synthesizer';
import { Player } from './tts/Player';
import { RealtimeParser } from './parser/RealtimeParser';
import { Checker } from './config/Checker';
import { logger } from './logger/Logger';

export class Application {
    private working = false;

    private tries = 0;

    private trigger: Gpio | undefined;

    private ptt: Gpio | undefined;

    private running = false;

    constructor(private config: Config) {}

    getConfig(): Config {
      return this.config;
    }

    setConfig(cfg: Config): void {
      this.config = cfg;
    }

    isRunning(): boolean {
      return this.running;
    }

    run(): void {
      Checker.check(this.config);
      if (Gpio.accessible) {
        logger.info(`Running. Waiting for input on GPIO ${this.config.gpio.input}`);
        this.trigger = new Gpio(this.config.gpio.input, 'in', 'falling');
        this.ptt = new Gpio(this.config.gpio.output, 'out', 'none', { debounceTimeout: 10 });
        this.trigger.watch((err, value) => {
          logger.info(`Received signal: ${value}`);
          if (err) {
            logger.error(err);
          }
          this.talk(this.config);
        });
        process.on('SIGINT', () => {
          if (this.ptt && this.trigger) {
            this.ptt.unexport();
            this.trigger.unexport();
          }
        });
      } else {
        logger.info('GPIO not available. Press enter to pull the trigger.');
        process.stdin.on('data', () => {
          this.talk(this.config);
        });
      }
      this.running = true;
    }

    stop(): void {
      if (this.trigger) {
        this.trigger.unwatchAll();
      } else {
        process.stdin.removeAllListeners();
      }
      logger.info('Application stopped.');
      this.running = false;
    }

    private async talk(cfg: Config): Promise<void> {
      if (this.working) {
        return;
      }
      this.working = true;
      try {
        const response = await axios.get(cfg.realtime.url);
        const parser = new RealtimeParser();
        const weather = await parser.parse(response.data);
        if (Gpio.accessible && this.ptt) {
          this.ptt.writeSync(1);
          logger.debug(`PTT start: GPIO value: ${this.ptt.readSync()}`);
        }
        await this.synthesizeAndPlay(weather, cfg);
      } catch (err) {
        logger.error(err);
        this.working = false;
        if (Gpio.accessible && this.ptt) {
          this.ptt.writeSync(0);
          logger.debug(`PTT stop: GPIO value: ${this.ptt.readSync()}`);
        }
        // eslint-disable-next-line no-use-before-define
        this.tryAgain(cfg);
      } finally {
        this.working = false;
        if (Gpio.accessible && this.ptt) {
          this.ptt.writeSync(0);
          logger.debug(`PTT stop: GPIO value: ${this.ptt.readSync()}`);
        }
      }
    }

    private async synthesizeAndPlay(weather: Weather, cfg: Config): Promise<void> {
      const msg = Message.createFrom(weather, cfg.message);
      logger.debug(msg);
      const output = path.join(__dirname, '..', 'output.mp3');
      await Synthesizer.synthesize(msg, output, cfg.google.tts.language);
      await Player.play(output);
      this.tries = 0;
    }

    private tryAgain(cfg: Config): void {
      logger.info('Failed talk(). Trying again.');
      if (this.tries < 3) {
        this.tries += 1;
        setTimeout(() => {
          this.talk(cfg);
        }, 750);
      } else {
        if (this.ptt && this.trigger) {
          this.ptt.unexport();
          this.trigger.unexport();
        }
        process.exit();
      }
    }
}
