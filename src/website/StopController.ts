import { Request, Response, Router } from 'express';
import { Application } from '../Application';
import { logger } from '../logger/Logger';

export class StopController {
    public path = '/stop';

    public router = Router();

    constructor(private app: Application) {
      this.router.get(this.path, this.stopApplication);
    }

    stopApplication = (_: Request, response: Response): void => {
      logger.info('Stopping the application.');
      this.app.stop();
      response.redirect('/settings');
    };
}
