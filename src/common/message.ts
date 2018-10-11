export class Message {
    type: MessageType;
    message: string;
    percent: number;
    result?: any;
    wexbimId?: number;
}

export enum MessageType {
    PROGRESS,
    COMPLETED,
    FAILED
}