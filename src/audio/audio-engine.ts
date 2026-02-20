export class AudioEngine {
    private context: AudioContext | null = null;

    constructor() {}

    public init(): void {
        if (!this.context) {
            this.context = new AudioContext();
            console.log("Audio Engine Initialized");
        }
    }

    public beep(frequency: number = 440, duration: number = 0.1, startTimeOffset: number = 0): void {
        if (!this.context) return;
        
        const startTime = this.context.currentTime + startTimeOffset;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    public fanfare(): void {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            this.beep(freq, 0.2, i * 0.15);
        });
    }
}
