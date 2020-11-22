import { Container, interfaces } from 'inversify';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { Gpio } from 'onoff';
import { INVERSIFY_TYPES } from './inversify.types';
import { Config } from './config/Config';
import { RealtimeParser } from './weather/RealtimeParser';
import { Parser } from './weather/Parser';
import { Application } from './Application';
import { WeatherProvider } from './weather/WeatherProvider';
import { SettingsController } from './website/SettingsController';
import { StartController } from './website/StartController';
import { StopController } from './website/StopController';
import { DashboardController } from './website/DashboardController';
import { WebServer } from './WebServer';
import { Trigger } from './trigger/Trigger';
import { logger } from './logger/Logger';
import { ManualTrigger } from './trigger/ManualTrigger';
import { GPIOTrigger } from './trigger/GPIOTrigger';

const container = new Container();

// CONFIG
const config = <Config>YAML.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'config.yml'), 'utf8'));
container.bind<Config>(INVERSIFY_TYPES.Config).toConstantValue(config);

// PUSH TO TALK
if (Gpio.accessible) {
  container.bind<Gpio>(INVERSIFY_TYPES.GpioInput).toDynamicValue((context: interfaces.Context) => {
    const cfg = context.container.get<Config>(INVERSIFY_TYPES.Config);

    return new Gpio(cfg.gpio.input, 'in', 'falling');
  });
  container.bind<Gpio>(INVERSIFY_TYPES.GpioOutput).toDynamicValue((context: interfaces.Context) => {
    const cfg = context.container.get<Config>(INVERSIFY_TYPES.Config);

    return new Gpio(cfg.gpio.output, 'out', 'none', { debounceTimeout: 10 });
  });
  logger.debug('GPIO initialized');
  if (process.argv.includes('manual')) {
    container.bind<Trigger>(INVERSIFY_TYPES.Trigger).to(ManualTrigger);
  } else {
    container.bind<Trigger>(INVERSIFY_TYPES.Trigger).to(GPIOTrigger);
  }
} else {
  container.bind<Trigger>(INVERSIFY_TYPES.Trigger).to(ManualTrigger);
}
container.bind<Application>(INVERSIFY_TYPES.Application).to(Application).inSingletonScope();
container.bind<Parser>(INVERSIFY_TYPES.Parser).to(RealtimeParser);
container.bind<WeatherProvider>(INVERSIFY_TYPES.WeatherProvider).to(WeatherProvider);

// WEBSERVER
container.bind<DashboardController>(INVERSIFY_TYPES.DashboardController).to(DashboardController);
container.bind<SettingsController>(INVERSIFY_TYPES.SettingsController).to(SettingsController);
container.bind<StartController>(INVERSIFY_TYPES.StartController).to(StartController);
container.bind<StopController>(INVERSIFY_TYPES.StopController).to(StopController);
container.bind<Array<any>>(INVERSIFY_TYPES.Middlewares).toConstantValue([
  bodyParser.urlencoded({ extended: true }),
]);
container.bind<number>(INVERSIFY_TYPES.WebserverPort).toConstantValue(5000);
container.bind<Array<any>>(INVERSIFY_TYPES.Controllers).toDynamicValue((context: interfaces.Context) => [
  context.container.get(INVERSIFY_TYPES.DashboardController),
  context.container.get(INVERSIFY_TYPES.SettingsController),
  context.container.get(INVERSIFY_TYPES.StartController),
  context.container.get(INVERSIFY_TYPES.StopController),
]);
container.bind<WebServer>(INVERSIFY_TYPES.WebServer).to(WebServer);

export { container };
