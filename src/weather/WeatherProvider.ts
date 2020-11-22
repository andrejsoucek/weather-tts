import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Weather } from './Weather';
import { Parser } from './Parser';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class WeatherProvider {
  public constructor(
      @inject(INVERSIFY_TYPES.Parser) private readonly parser: Parser,
  ) {
  }

  async getCurrentWeather(url: string): Promise<Weather> {
    const response = await axios.get(url);

    return this.parser.parse(response.data);
  }
}
