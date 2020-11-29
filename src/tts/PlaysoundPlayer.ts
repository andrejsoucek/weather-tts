type PlayerCallback = (err: Error) => void;

export interface PlaysoundPlayer {
    play(path: string, callback: PlayerCallback): void;
}
