import express from 'express';
import { logger } from './logger/Logger';

export class WebServer {
    private readonly app: express.Application;

    constructor(middlewares: Array<any>, controllers: Array<any>, private readonly port: number) {
      this.app = express();
      this.initializeMiddlewares(middlewares);
      this.initializeControllers(controllers);
      this.app.set('view engine', 'pug');
    }

    public listen(): void {
      this.app.listen(this.port, () => {
        logger.info(`The application settings can be changed on localhost:${this.port}`);
      });
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
