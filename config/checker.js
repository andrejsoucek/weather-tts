const path = require('path');
const validateSchema = require('yaml-schema-validator');

const requiredSchema = {
  gpio: {
    pin: {type: Number, required: true},
  },
  google: {
    auth: {
      keyPath: {type: String, required: true},
    },
    tts: {
      language: {type: String, required: true},
    },
  },
  realtime: {
    url: {type: String, required: true},
  },
  message: {
    template: {type: String, required: true},
    timezoneOffset: {type: String, required: true},
    wind: {
      calm: {type: String, required: true},
      speedUnits: {type: String, required: true},
      bearingUnits: {type: String, required: true},
      gust: {type: String, required: true},
    },
    rwy: [
      {
        number: {type: String, required: true},
        condition: {type: String, required: true},
      },
    ],
    circuits: [
      {
        text: {type: String, required: true},
        condition: {type: String, required: true},
      },
    ],
    temperature: {
      units: {type: String, required: true},
    },
    cloudbase: {
      units: {type: String, required: true},
    },
  },
};
schemaErrors = validateSchema(path.join(__dirname, '/config.yml'), {schema: requiredSchema});
