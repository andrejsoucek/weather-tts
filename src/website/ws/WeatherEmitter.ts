import { Server } from 'socket.io';
import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
import { Emitter } from './Emitter';
import { INVERSIFY_TYPES } from '../../inversify.types';
import { WeatherProvider } from '../../weather/WeatherProvider';
import { Config } from '../../config/Config';
import { logger } from '../../logger/Logger';

@injectable()
export class WeatherEmitter implements Emitter {
  private clientCount = 0;

  constructor(
      @inject(INVERSIFY_TYPES.Config) private readonly config: Config,
      @inject(INVERSIFY_TYPES.WeatherProvider) private readonly weatherProvider: WeatherProvider,
  ) {
  }

  emit(io: Server): void {
    io.on('connection', (socket) => {
      this.clientCount += 1;

      const fetchAndEmit = (): void => {
        if (this.clientCount > 0) {
          this.weatherProvider.getCurrentWeather(this.config.realtime.url)
            .then((weather) => {
              const dateTime = moment(`${weather.date} ${weather.time}`, 'DD/MM/YYYY hh:mm:ss').format('YYYY-MM-DD HH:mm');
              const utcTime = moment.tz(dateTime, this.config.message.timezone).tz('UTC');
              io.emit('current_weather', JSON.stringify({ ...weather, utctime: utcTime.format('HH:mm') }));
            })
            .catch((e) => {
              logger.error(e);
            });
        }
      };

      socket.on('disconnect', () => {
        this.clientCount -= 1;
      });

      fetchAndEmit();
      setInterval(fetchAndEmit, 15 * 1000);
    });
  }
}
