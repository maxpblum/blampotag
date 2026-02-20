export class AudioEngine {
    private context: AudioContext | null = null;

    constructor() {
        // Initialization must be triggered by user interaction
    }

    public init(): void {
        if (!this.context) {
            this.context = new AudioContext();
            console.log("Audio Engine Initialized");
        }
    }

    public beep(frequency: number = 440, duration: number = 0.1): void {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();

        oscillator.type = "square"; // PC Speaker vibe
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.start();
        oscillator.stop(this.context.currentTime + duration);
    }
}
