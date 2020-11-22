import { inject, injectable } from 'inversify';
import { Config } from './config/Config';
import { Checker } from './config/Checker';
import { logger } from './logger/Logger';
import { Trigger } from './trigger/Trigger';
import { INVERSIFY_TYPES } from './inversify.types';
import { container } from './inversify.container';

@injectable()
export class Application {
    private running = false;

    constructor(
        @inject(INVERSIFY_TYPES.Trigger) private trigger: Trigger,
        @inject(INVERSIFY_TYPES.Config) private config: Config,
    ) {
    }

    getConfig(): Config {
      return this.config;
    }

    setConfig(cfg: Config): void {
      container.rebind<Config>(INVERSIFY_TYPES.Config).toConstantValue(cfg);
      this.config = cfg;
      this.trigger.unlisten();
    }

    isRunning(): boolean {
      return this.running;
    }

    run(): void {
      Checker.check(this.config);
      this.trigger.listen(this.config);
      this.running = true;
    }

    stop(): void {
      this.trigger.unlisten();
      this.running = false;
      logger.info('Application stopped.');
    }
}
