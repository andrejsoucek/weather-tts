import path from 'path';
import YAML from 'yaml';
import * as fs from 'fs';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import { Config } from './config/Config';
import { Application } from './Application';
import { WebServer } from './WebServer';
import { SettingsController } from './website/SettingsController';
import { StartController } from './website/StartController';
import { StopController } from './website/StopController';

// eslint-disable-next-line no-console
console.log(figlet.textSync('Weather TTS', 'Mini'));
// eslint-disable-next-line no-console
console.log('==========================================');

const config = <Config>YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8'));

process.env.GOOGLE_APPLICATION_CREDENTIALS = config.google.auth.keyPath;

const app = new Application(config);
app.run();

const web = new WebServer([
  bodyParser.urlencoded({ extended: true }),
], [
  new SettingsController(app),
  new StartController(app),
  new StopController(app),
], 5000);
web.listen();
