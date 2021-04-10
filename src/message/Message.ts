import moment from 'moment-timezone';
import { Weather } from '../weather/Weather';
import { Operation } from './Operation';
import { MessageConfig } from '../config/MessageConfig';
import { TextCondition } from '../config/TextCondition';
import { UnitsConfig } from '../config/UnitsConfig';
import { Comparators } from './Comparators';

export class Message {
    private static operations = new Map<Comparators, Operation>([
      [Comparators.LESS_THAN, (a: number, b: number) => a < b],
      [Comparators.HIGHER_THAN, (a: number, b: number) => a > b],
      [Comparators.LESS_THAN_OR_EQUAL, (a: number, b: number) => a <= b],
      [Comparators.HIGHER_THAN_OR_EQUAL, (a: number, b: number) => a >= b],
    ]);

    static createFrom(weather: Weather, cfg: MessageConfig): string {
      const { template } = cfg;

      const replaced = template
        .replace('<#TIME>', this.formatTime(weather.time, weather.date, cfg.timezone))
        .replace('<#WIND>', this.formatWind(weather.wspeed, weather.wgust, weather.bearing, cfg.wind))
        .replace('<#RWY>', this.formatRwy(weather.bearing, cfg.rwy))
        .replace('<#CIRCUIT>', this.formatCircuit(weather.bearing, cfg.circuits))
        .replace('<#TEMP>', this.formatTemperature(weather.temp, cfg.temperature))
        .replace('<#CLOUDBASE>', this.formatCloudbase(weather.cloudbasevalue, cfg.cloudbase))
        .replace('<#QNH>', this.formatQnh(weather.press))
        .replace(new RegExp('<#BREAK-NONE>', 'gm'), this.formatBreakNone())
        .replace(new RegExp('<#BREAK-SHORT>', 'gm'), this.formatBreakShort())
        .replace(new RegExp('<#BREAK-LONG>', 'gm'), this.formatBreakLong());

      return `<speak>${replaced}</speak>`;
    }

    private static formatTime(time: string, date: string, tz: string): string {
      const dateTime = moment(`${date} ${time}`, 'DD/MM/YYYY hh:mm:ss').format('YYYY-MM-DD HH:mm');
      const utcTime = moment.tz(dateTime, tz).tz('UTC');

      return `<say-as interpret-as="time" format="hm24Z">${utcTime.format('HH:mm')} UTC</say-as>`;
    }

    private static formatWind(
      speed: string, gust: string, bearing: string, cfg: Record<string, string>,
    ): string {
      const speedFloat = parseFloat(speed);
      if (speedFloat < 2) {
        return cfg.calm;
      }
      const b = `<say-as interpret-as="characters">${bearing}</say-as> ${cfg.bearingUnits}`;
      const s = `<say-as interpret-as="characters">${Math.round(parseFloat(speed))}</say-as> ${cfg.speedUnits}`;
      const g = parseFloat(gust) - speedFloat > 3
        ? `. ${cfg.gust} <say-as interpret-as="characters">${Math.round(parseFloat(gust))}</say-as>`
        : '';

      return `${b} ${s}${g}`;
    }

    private static formatRwy(bearing: string, cfg: Array<TextCondition>): string {
      for (let i = 0; i < cfg.length; i += 1) {
        const c = cfg[i];
        const comparator = c.comparator as Comparators;
        const operation = this.operations.get(comparator);
        if (operation && operation(parseFloat(bearing), c.value)) {
          return `<say-as interpret-as="characters">${c.result.padStart(2, '0')}</say-as>`;
        }
      }

      return '';
    }

    private static formatCircuit(bearing: string, cfg: Array<TextCondition>): string {
      for (let i = 0; i < cfg.length; i += 1) {
        const c = cfg[i];
        const comparator = c.comparator as Comparators;
        const operation = this.operations.get(comparator);
        if (operation && operation(parseFloat(bearing), c.value)) {
          return c.result;
        }
      }

      return '';
    }

    private static formatTemperature(temperature: string, cfg: UnitsConfig): string {
      return `<say-as interpret-as="cardinal">${Math.round(parseFloat(temperature))}</say-as> ${cfg.units}`;
    }

    private static formatCloudbase(cloudbase: string, cfg: UnitsConfig): string {
      return `<say-as interpret-as="cardinal">${cloudbase}</say-as> ${cfg.units}`;
    }

    private static formatQnh(pressure: string): string {
      return `<say-as interpret-as="characters">${Math.round(parseFloat(pressure))}</say-as>`;
    }

    private static formatBreakNone(): string {
      return '<break time="50ms"/>';
    }

    private static formatBreakShort(): string {
      return '<break time="500ms"/>';
    }

    private static formatBreakLong(): string {
      return '<break time="1000ms"/>';
    }
}
