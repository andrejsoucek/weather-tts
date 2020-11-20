import { Config } from './config/Config';
import { Checker } from './config/Checker';
import { logger } from './logger/Logger';
import { Trigger } from './trigger/Trigger';
import { TriggerFactory } from './trigger/TriggerFactory';

export class Application {
    private running = false;

    private trigger: Trigger;

    constructor(
        private triggerFactory: TriggerFactory,
        private config: Config,
    ) {
      this.trigger = this.triggerFactory.createTrigger(config.gpio);
    }

    getConfig(): Config {
      return this.config;
    }

    setConfig(cfg: Config): void {
      this.config = cfg;
      this.trigger = this.triggerFactory.createTrigger(cfg.gpio);
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
