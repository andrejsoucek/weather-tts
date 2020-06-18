import path from 'path';
import YAML from 'yaml';
import * as fs from 'fs';
import axios from 'axios';
import { Gpio } from 'onoff';
import RealtimeParser from './parser/RealtimeParser';
import { Weather } from './parser/Weather';
import Synthesizer from './tts/Synthesizer';
import Player from './tts/Player';
import Message from './message/Message';
import Checker from './config/Checker';
import { Config } from './config/Config';

const config = <Config>YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8'));

process.env.GOOGLE_APPLICATION_CREDENTIALS = config.google.auth.keyPath;

let working = false;
let tries = 0;

async function synthesizeAndPlay(weather: Weather, cfg: Config): Promise<void> {
  const msg = Message.createFrom(weather, cfg.message);
  const output = path.join(__dirname, '../output.mp3');
  await Synthesizer.synthesize(msg, output, cfg.google.tts.language);
  await Player.play(output);
}

async function fetch(cfg: Config): Promise<void> {
  if (working) {
    return;
  }
  working = true;
  try {
    const response = await axios.get(cfg.realtime.url);
    const parser = new RealtimeParser();
    const weather = await parser.parse(response.data);
    await synthesizeAndPlay(weather, cfg);
  } catch (err) {
    console.log(err);
    working = false;
    // eslint-disable-next-line no-use-before-define
    tryAgain(cfg);
  } finally {
    working = false;
  }
}

function tryAgain(cfg: Config): void {
  if (tries < 3) {
    tries += 1;
    setTimeout(() => {
      fetch(cfg);
    }, 750);
  } else {
    process.exit();
  }
}

function run(cfg: Config) {
  Checker.check(cfg);
  if (Gpio.accessible) {
    console.log(`Running. Waiting for input on pin ${cfg.gpio.pin}`);
    const button = new Gpio(cfg.gpio.pin, 'in', 'both');
    button.watch((err, value) => {
      console.log(`Received signal: ${value}`);
      if (err) {
        console.log(err);
      }
      fetch(cfg);
    });
  } else {
    console.log('GPIO not available. Press enter to pull the trigger.');
    process.stdin.on('data', () => {
      fetch(cfg);
    });
  }
}

run(config);
