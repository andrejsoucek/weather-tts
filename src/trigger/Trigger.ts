import { Config } from '../config/Config';

export interface Trigger {
    listen(config: Config): void;
    unlisten(): void;
}
