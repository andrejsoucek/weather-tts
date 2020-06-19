import { Request, Response, Router } from 'express';
import { Application } from '../Application';

export class StartController {
    public path = '/start';

    public router = Router();

    constructor(private app: Application) {
      this.router.get(this.path, this.startApplication);
    }

    startApplication = (_: Request, response: Response): void => {
      console.log('Starting the application.');
      this.app.run();
      response.redirect('/');
    };
}
