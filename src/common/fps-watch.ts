export class FpsWatch {
    private buffer: CircularBuffer = new CircularBuffer(20);

    /**
     *
     */
    constructor(frameRequest: (callback: FrameRequestCallback) => number) {
        const watch = (time: DOMHighResTimeStamp) => {
            this.buffer.next(time);
            frameRequest(watch)
        };
        frameRequest(watch)
    }

    public get fps(): number {

        const first = this.buffer.first;
        const last = this.buffer.last;
        if (first == null || last == null)
            return 60;  // Before the buffer is filled assume 60FPS. 

        return this.buffer.size / (last - first) * 1000;
    }
}

class CircularBuffer {
    private inner: number[] = [];
    private idx = 0;

    /**
     *
     */
    constructor(public size: number) {

    }

    public next(value: number) {
        this.inner[this.idx] = value;
        this.idx = (this.idx + 1) % this.size;
    }

    public get first(): number {
        return this.inner[this.idx];
    }

    public get last(): number {
        const i = (this.idx + this.size - 1) % this.size;
        return this.inner[i];
    }
}