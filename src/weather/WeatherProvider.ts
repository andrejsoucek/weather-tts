import axios from 'axios';
import { Weather } from './Weather';
import { Parser } from './Parser';

export class WeatherProvider {
  public constructor(private readonly parser: Parser) {
  }

  async getCurrentWeather(url: string): Promise<Weather> {
    const response = await axios.get(url);

    return this.parser.parse(response.data);
  }
}
