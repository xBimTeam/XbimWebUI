export class Message {
    public type: MessageType;
    public message: string;
    public percent: number;
    public result?: any;
    public wexbimId?: number;
}

export enum MessageType {
    PROGRESS,
    COMPLETED,
    FAILED
}
