import { inject, injectable } from 'inversify';
import { INVERSIFY_TYPES } from '../inversify.types';
import { PlaysoundPlayer } from './PlaysoundPlayer';

@injectable()
export class Player {
  constructor(
      @inject(INVERSIFY_TYPES.PlaysoundPlayer) private readonly player: PlaysoundPlayer,
  ) {
  }

  public play(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.player.play(path, (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
