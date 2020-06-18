import { Config } from './Config';

const validate = require('yaml-schema-validator');

export default class Checker {
  private static readonly structure = {
    gpio: {
      pin: { type: Number, required: true },
    },
    google: {
      auth: {
        keyPath: { type: String, required: true },
      },
      tts: {
        language: { type: String, required: true },
      },
    },
    realtime: {
      url: { type: String, required: true },
    },
    message: {
      template: { type: String, required: true },
      timezoneOffset: { type: String, required: false },
      wind: {
        calm: { type: String, required: true },
        speedUnits: { type: String, required: true },
        bearingUnits: { type: String, required: true },
        gust: { type: String, required: true },
      },
      rwy: [
        {
          result: { type: String, required: true },
          condition: { type: String, required: true },
        },
      ],
      circuits: [
        {
          result: { type: String, required: true },
          condition: { type: String, required: true },
        },
      ],
      temperature: {
        units: { type: String, required: true },
      },
      cloudbase: {
        units: { type: String, required: true },
      },
    },
  };

  static check(cfg: Config): void {
    const errors = validate(cfg, { schema: this.structure });
    if (errors.length) {
      process.exit();
    }
  }
}
