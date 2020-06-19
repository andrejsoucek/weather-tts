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

export class Application {
    private working = false;

    private tries = 0;

    private button: Gpio | undefined;

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
        console.log(`Running. Waiting for input on pin ${this.config.gpio.pin}`);
        this.button = new Gpio(this.config.gpio.pin, 'in', 'both');
        this.button.watch((err, value) => {
          console.log(`Received signal: ${value}`);
          if (err) {
            console.log(err);
          }
          this.fetch(this.config);
        });
      } else {
        console.log('GPIO not available. Press enter to pull the trigger.');
        process.stdin.on('data', () => {
          this.fetch(this.config);
        });
      }
      this.running = true;
    }

    stop(): void {
      if (this.button) {
        this.button.unwatchAll();
      } else {
        process.stdin.removeAllListeners();
      }
      console.log('Application stopped.');
      this.running = false;
    }

    private async fetch(cfg: Config): Promise<void> {
      if (this.working) {
        return;
      }
      this.working = true;
      try {
        const response = await axios.get(cfg.realtime.url);
        const parser = new RealtimeParser();
        const weather = await parser.parse(response.data);
        await this.synthesizeAndPlay(weather, cfg);
      } catch (err) {
        console.trace(err);
        this.working = false;
        // eslint-disable-next-line no-use-before-define
        this.tryAgain(cfg);
      } finally {
        this.working = false;
      }
    }

    private async synthesizeAndPlay(weather: Weather, cfg: Config): Promise<void> {
      const msg = Message.createFrom(weather, cfg.message);
      const output = path.join(__dirname, '../output.mp3');
      await Synthesizer.synthesize(msg, output, cfg.google.tts.language);
      await Player.play(output);
      this.tries = 0;
    }

    private tryAgain(cfg: Config): void {
      if (this.tries < 3) {
        this.tries += 1;
        setTimeout(() => {
          this.fetch(cfg);
        }, 750);
      } else {
        process.exit();
      }
    }
}
