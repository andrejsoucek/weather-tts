import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Application } from '../Application';
import { logger } from '../logger/Logger';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class StartController {
    public path = '/start';

    public router = Router();

    constructor(
        @inject(INVERSIFY_TYPES.Application) private readonly app: Application,
    ) {
      this.router.get(this.path, this.startApplication);
    }

    startApplication = (_: Request, response: Response): void => {
      logger.info('Starting the application');
      this.app.run();
      response.redirect('/settings');
    };
}
