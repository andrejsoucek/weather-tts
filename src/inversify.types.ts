const INVERSIFY_TYPES = {
  Application: Symbol.for('Application'),
  Config: Symbol.for('Config'),
  DashboardController: Symbol.for('DashboardController'),
  SettingsController: Symbol.for('SettingsController'),
  StartController: Symbol.for('StartController'),
  StopController: Symbol.for('StopController'),
  Parser: Symbol.for('Parser'),
  GpioInput: Symbol.for('GpioInput'),
  GpioOutput: Symbol.for('GpioOutput'),
  WebserverPort: Symbol.for('WebserverPort'),
  Middlewares: Symbol.for('Middlewares'),
  Controllers: Symbol.for('Controllers'),
  Trigger: Symbol.for('Trigger'),
  WeatherProvider: Symbol.for('WeatherProvider'),
  WebServer: Symbol.for('WebServer'),
};

export { INVERSIFY_TYPES };
