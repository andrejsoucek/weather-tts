const axios = require('axios');
const realtime = require('./realtime');
const message = require('./message');
const tts = require('./tts');
const player = require('./player');
const Gpio = require('onoff').Gpio;
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const cfg = YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8'));

process.env.GOOGLE_APPLICATION_CREDENTIALS=cfg.google.auth.keyPath;

let working = false;
let tries = 0;

/**
 * @param {object} cfg
 * Waits for the trigger and starts the process when triggered.
 */
function run(cfg) {
  if (Gpio.accessible) {
    console.log(`Running. Waiting for input on pin ${cfg.gpio.pin}`);
    const button = new Gpio(cfg.gpio.pin, 'in', 'both');
    button.watch((err, value) => {
      if (err) {
        console.log(err);
      }
      _fetch(cfg);
    });
  } else {
    console.log('GPIO not available. Press enter to pull the trigger.');
    process.stdin.on( 'data', () => {
      _fetch(cfg);
    });
  }
}

/**
 * Create request and process it
 * @param {object} cfg
 * @private
 */
function _fetch(cfg) {
  if (working === true) {
    return;
  }
  working = true;
  axios.get(cfg.realtime.url)
      .then((response) => {
        return _synthesizeAndPlay(response, cfg);
      })
      .catch((err) => {
        working = false;
        tryAgain(cfg);
      })
      .finally(() => {
        working = false;
      });
}

/**
 * Uses TTS and plays the output (mpg123 player).
 * @param {AxiosResponse} response
 * @param {object} cfg
 * @return {Promise}
 * @private
 */
function _synthesizeAndPlay(response, cfg) {
  const weather = realtime.parse(response.data);
  const msg = message.createFrom(weather, cfg.message);
  const output = path.join(__dirname, '../output.mp3');
  return tts.synthesize(msg, output, cfg.google.tts.language)
      .then(() => {
        return player.play(output);
      });
}

/**
 * Tries to repeat the process in case of an error.
 * Limited to 3 repeats. Each after 750 ms.
 * @param {object} cfg
 */
function tryAgain(cfg) {
  if (tries < 3) {
    tries++;
    setTimeout(() => {
      _fetch(cfg);
    }, 750);
  } else {
    process.exit();
  }
}

run(cfg);
