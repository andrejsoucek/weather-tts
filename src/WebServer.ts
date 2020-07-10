import express from 'express';
import path from 'path';
import { logger } from './logger/Logger';

export class WebServer {
    private readonly app: express.Application;

    constructor(middlewares: Array<any>, controllers: Array<any>, private readonly port: number) {
      this.app = express();
      this.initializeStaticContent();
      this.initializeMiddlewares(middlewares);
      this.initializeControllers(controllers);
      this.app.set('view engine', 'pug');
    }

    public listen(): void {
      this.app.listen(this.port, () => {
        logger.info(`The application settings can be changed on localhost:${this.port}`);
      });
    }

    private initializeStaticContent(): void {
      this.app.use('/bulma', express.static(path.join(__dirname, '../../node_modules/bulma/css')));
      this.app.use('/fa', express.static(path.join(__dirname, '../../node_modules/@fortawesome/fontawesome-free/js')));
    }

    private initializeMiddlewares(middlewares: Array<any>): void {
      middlewares.forEach((middleware) => {
        this.app.use(middleware);
      });
    }

    private initializeControllers(controllers: Array<any>): void {
      controllers.forEach((controller) => {
        this.app.use('/', controller.router);
      });
    }
}
