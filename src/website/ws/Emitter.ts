import { Server } from 'socket.io';

export interface Emitter {
    emit(io: Server): void;
}
