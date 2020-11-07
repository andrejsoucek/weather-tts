import { Config } from './Config';

const validate = require('yaml-schema-validator');

export class Checker {
  private static readonly structure = {
    gpio: {
      input: { type: Number, required: true },
      output: { type: Number, required: true },
    },
    google: {
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
          comparator: { type: String, required: true },
          value: { type: Number, required: true },
        },
      ],
      circuits: [
        {
          result: { type: String, required: true },
          comparator: { type: String, required: true },
          value: { type: Number, required: true },
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
