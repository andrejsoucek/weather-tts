import { GpioConfig } from './GpioConfig';
import { GoogleConfig } from './GoogleConfig';
import { RealtimeConfig } from './RealtimeConfig';
import { MessageConfig } from './MessageConfig';

export interface Config {
    gpio: GpioConfig,
    google: GoogleConfig,
    realtime: RealtimeConfig,
    message: MessageConfig,
}
