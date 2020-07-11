import { Request, Response, Router } from 'express';
import { Application } from '../Application';
import { logger } from '../logger/Logger';

export class StartController {
    public path = '/start';

    public router = Router();

    constructor(private app: Application) {
      this.router.get(this.path, this.startApplication);
    }

    startApplication = (_: Request, response: Response): void => {
      logger.info('Starting the application');
      this.app.run();
      response.redirect('/settings');
    };
}
