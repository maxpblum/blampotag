export type TickCallback = (timestamp: number) => void;

export interface TimeSource {
    requestAnimationFrame(callback: FrameRequestCallback): number;
}

export class Ticker {
    private running = false;

    constructor(
        private readonly callback: TickCallback,
        private readonly timeSource: TimeSource = window
    ) {}

    public start(): void {
        this.running = true;
        this.timeSource.requestAnimationFrame(this.tick);
    }

    public stop(): void {
        this.running = false;
    }

    private readonly tick = (timestamp: number): void => {
        if (!this.running) return;
        this.callback(timestamp);
        this.timeSource.requestAnimationFrame(this.tick);
    };
}
