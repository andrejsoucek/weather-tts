import express from 'express';
import path from 'path';
import { inject, injectable } from 'inversify';
import { logger } from './logger/Logger';
import { INVERSIFY_TYPES } from './inversify.types';

@injectable()
export class WebServer {
    private readonly app: express.Application;

    constructor(
      @inject(INVERSIFY_TYPES.Middlewares) middlewares: Array<any>,
      @inject(INVERSIFY_TYPES.Controllers) controllers: Array<any>,
      @inject(INVERSIFY_TYPES.WebserverPort) private readonly port: number,
    ) {
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
      this.app.use('/bulma', express.static(
        path.join(__dirname, '..', '..', 'node_modules', 'bulma', 'css'),
      ));
      this.app.use('/chartjs', express.static(
        path.join(__dirname, '..', '..', 'node_modules', 'chart.js', 'dist'),
      ));
      this.app.use('/chartjs-datalabels', express.static(
        path.join(__dirname, '..', '..', 'node_modules', 'chartjs-plugin-datalabels', 'dist'),
      ));
      this.app.use('/fa', express.static(
        path.join(__dirname, '..', '..', 'node_modules', '@fortawesome', 'fontawesome-free', 'js'),
      ));
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
