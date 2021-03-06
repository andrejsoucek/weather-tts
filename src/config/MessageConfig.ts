import { TextCondition } from './TextCondition';
import { UnitsConfig } from './UnitsConfig';

export interface MessageConfig {
    template: string;
    timezone: string;
    wind: {
        calm: string;
        speedUnits: string;
        bearingUnits: string;
        gust: string;
    };
    rwy: Array<TextCondition>;
    circuits: Array<TextCondition>;
    temperature: UnitsConfig;
    cloudbase: UnitsConfig;
}
