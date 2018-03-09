export class Message {
    type: MessageType;
    message: string;
    percent: number;
    result?: any;
}

export enum MessageType {
    PROGRESS,
    COMPLETED,
    FAILED
}