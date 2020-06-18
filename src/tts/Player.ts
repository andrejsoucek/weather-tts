const player = require('play-sound')({ player: 'mpg123' });

export default class Player {
  static play(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      player.play(path, (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
