import path from 'path';
import YAML from 'yaml';
import * as fs from 'fs';
import figlet from 'figlet';
import { Config } from './config/Config';
import { Application } from './Application';

/* eslint-disable no-console */
console.log(figlet.textSync('Weather TTS', 'Mini'));
console.log('==========================================');

const config = <Config>YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8'));

process.env.GOOGLE_APPLICATION_CREDENTIALS = config.google.auth.keyPath;

const app = new Application(config);
app.run();
