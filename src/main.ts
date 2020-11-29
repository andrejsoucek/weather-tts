import 'reflect-metadata';
import figlet from 'figlet';
import { Application } from './Application';
import { WebServer } from './WebServer';
import { Repository } from './persistence/Repository';
import { logger } from './logger/Logger';
import { container } from './inversify.container';
import { INVERSIFY_TYPES } from './inversify.types';

// eslint-disable-next-line no-console
console.log(figlet.textSync('Weather TTS', 'Mini'));
// eslint-disable-next-line no-console
console.log('==========================================');

const repository = container.get<Repository>(INVERSIFY_TYPES.Repository);
repository.runMigrations()
  .then(() => {
    logger.debug('DB Migrations finished successfully');
  });

const app = container.get<Application>(INVERSIFY_TYPES.Application);
app.run();

const web = container.get<WebServer>(INVERSIFY_TYPES.WebServer);
web.listen();
