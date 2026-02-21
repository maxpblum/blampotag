export class AudioEngine {
    private context: AudioContext | null = null;

    constructor(context?: AudioContext) {
        if (context) {
            this.context = context;
        }
    }

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

    private musicTimeout: number | null = null;
    public playSequence(notes: { freq: number, duration: number }[], tempoBpm: number, loop: boolean = true): void {
        this.stopSequence();
        if (!this.context) return;

        const beatDuration = 60 / tempoBpm;
        let noteIndex = 0;

        const scheduleNext = () => {
            if (noteIndex >= notes.length) {
                if (loop) {
                    noteIndex = 0;
                } else {
                    return;
                }
            }

            const note = notes[noteIndex]!;
            if (note.freq > 0) {
                this.beep(note.freq, note.duration * beatDuration * 0.9);
            }
            
            this.musicTimeout = window.setTimeout(scheduleNext, note.duration * beatDuration * 1000);
            noteIndex++;
        };

        scheduleNext();
    }

    public stopSequence(): void {
        if (this.musicTimeout !== null) {
            window.clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
    }
}
