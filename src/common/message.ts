export class Message {
    public type: MessageType;
    public message: string;
    public percent: number;
    public result?: any;
    public wexbimId?: number;
    public phase: LoadingPhase;
}

/** Converts a Message to a aggregate percent completed based naive assumption that phases are equal */
export function MessageProgress(msg: Message): number {
    const maxPhases = 3;
    const perPhase = 100 / maxPhases;
    const done = (perPhase * msg.phase) + ((perPhase * msg.percent) / 100);
    return done;
}

export enum MessageType {
    PROGRESS,
    COMPLETED,
    FAILED
}

export enum LoadingPhase {
    DOWNLOADING,
    READING,
    LOADING
}