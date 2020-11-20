import { Gpio } from 'onoff';
import { GpioConfig } from '../config/GpioConfig';
import { WeatherProvider } from '../weather/WeatherProvider';
import { GPIOTrigger } from './GPIOTrigger';
import { ManualTrigger } from './ManualTrigger';
import { Trigger } from './Trigger';
import { logger } from '../logger/Logger';

export class TriggerFactory {
  constructor(private readonly wp: WeatherProvider) {
  }

  createTrigger(config: GpioConfig): Trigger {
    if (Gpio.accessible) {
      const input = new Gpio(config.input, 'in', 'falling');
      const output = new Gpio(config.output, 'out', 'none', { debounceTimeout: 10 });
      logger.debug('GPIO initialized');

      if (process.argv.includes('manual')) {
        return new ManualTrigger(this.wp);
      }

      return new GPIOTrigger(this.wp, input, output);
    }

    return new ManualTrigger(this.wp);
  }
}
