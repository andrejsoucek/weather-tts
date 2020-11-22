import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Application } from '../Application';
import { logger } from '../logger/Logger';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class StopController {
    public path = '/stop';

    public router = Router();

    constructor(
        @inject(INVERSIFY_TYPES.Application) private readonly app: Application,
    ) {
      this.router.get(this.path, this.stopApplication);
    }

    stopApplication = (_: Request, response: Response): void => {
      logger.info('Stopping the application.');
      this.app.stop();
      response.redirect('/settings');
    };
}
