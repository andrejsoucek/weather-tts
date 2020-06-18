import { Weather } from './Weather';

export interface Parser {
    parse(txt: String): Promise<Weather>
}
