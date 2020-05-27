const player = require('play-sound')(opts = {player: 'mpg123'});

/**
 * Plays the file on the given path.
 * @param {string} path
 * @return {Promise}
 */
function play(path) {
  return new Promise((resolve, reject) => {
    player.play(path, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

exports.play = play;
