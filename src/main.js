const axios = require('axios');
const realtime = require('./realtime');
const message = require('./message');
const tts = require('./tts');
const player = require('play-sound')(opts = {player: 'mpg123'});
const Gpio = require('onoff').Gpio;
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const cfg = YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8'));

process.env.GOOGLE_APPLICATION_CREDENTIALS=cfg.google.auth.path;

let working = false;

/**
 * @param {object} cfg
 * Waits for the trigger and starts the process when triggered.
 */
function run(cfg) {
  if (Gpio.accessible) {
    const button = new Gpio(cfg.gpio.pin, 'in', Gpio.HIGH);
    button.watch((err, value) => {
      if (err) {
        console.log(err);
      }
      _fetch(cfg);
    });
  } else {
    console.log('GPIO not available. Press any key to pull the trigger.');
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
        _synthesizeAndPlay(response, cfg.message);
      })
      .catch((err) => {
        console.log(err);
        working = false;
      });
}

/**
 * Uses TTS and plays the output (mpg123 player).
 * @param {AxiosResponse} response
 * @param {object} cfg
 * @private
 */
function _synthesizeAndPlay(response, cfg) {
  const weather = realtime.parse(response.data);
  const msg = message.createFrom(weather, cfg);
  const path = '/home/andrej/Plocha/output.mp3';
  tts.synthesize(msg, path)
      .then(() => {
        console.log('Audio content written to file: output.mp3');
        player.play(path, (err) => {
          if (err) {
            console.log(err);
          }
          working = false;
        });
      })
      .catch((err) => {
        console.log(err);
        working = false;
      });
}

run(cfg);
