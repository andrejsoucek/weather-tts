import * as fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { GpioConfig } from './GpioConfig';
import { GoogleConfig } from './GoogleConfig';
import { RealtimeConfig } from './RealtimeConfig';
import { MessageConfig } from './MessageConfig';
import { logger } from '../logger/Logger';

export interface Config {
    gpio: GpioConfig;
    google: GoogleConfig;
    realtime: RealtimeConfig;
    message: MessageConfig;
}

function createCfgFrom(values: any): Config {
  return {
    gpio: {
      pin: parseInt(values.gpio, 10),
    },
    realtime: {
      url: values['realtime-url'],
    },
    google: {
      auth: {
        keyPath: values['google-key'],
      },
      tts: {
        language: values['google-language'],
      },
    },
    message: {
      timezoneOffset: values['message-timezone-offset'],
      template: values['message-template'],
      wind: {
        calm: values['message-wind-calm'],
        speedUnits: values['message-wind-speed-unit'],
        bearingUnits: values['message-wind-bearing-unit'],
        gust: values['message-wind-gust'],
      },
      rwy: [
        {
          comparator: values['message-rwy-comparator-0'],
          value: parseInt(values['message-rwy-value-0'], 10),
          result: values['message-rwy-result-0'],
        },
        {
          comparator: values['message-rwy-comparator-1'],
          value: parseInt(values['message-rwy-value-1'], 10),
          result: values['message-rwy-result-1'],
        },
      ],
      circuits: [
        {
          comparator: values['message-circuit-comparator-0'],
          value: parseInt(values['message-circuit-value-0'], 10),
          result: values['message-circuit-result-0'],
        },
        {
          comparator: values['message-circuit-comparator-1'],
          value: parseInt(values['message-circuit-value-1'], 10),
          result: values['message-circuit-result-1'],
        },
      ],
      temperature: {
        units: values['message-temperature-unit'],
      },
      cloudbase: {
        units: values['message-cloudbase-unit'],
      },
    },
  };
}

export function saveConfig(values: any): Config {
  const cfg = createCfgFrom(values);
  fs.writeFile(
    path.join(__dirname, '..', '..', 'config', 'config.yml'),
    YAML.stringify(cfg), 'utf-8',
    (e: NodeJS.ErrnoException | null) => {
      if (e) {
        logger.error(e.message);
      }
    },
  );

  return cfg;
}
