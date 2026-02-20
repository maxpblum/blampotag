import { AudioEngine } from "./audio-engine";

export interface AudioEffectPlayer {
    playMove(): void;
    playFanfare(): void;
    playTag(): void;
    playSelect(): void;
    init(): void;
}

export class WebAudioPlayer implements AudioEffectPlayer {
    constructor(private readonly audioEngine: AudioEngine) {}

    public init(): void {
        this.audioEngine.init();
    }

    public playMove(): void {
        this.audioEngine.beep(400, 0.1);
    }

    public playFanfare(): void {
        this.audioEngine.fanfare();
    }

    public playTag(): void {
        this.audioEngine.beep(800, 0.2);
    }

    public playSelect(): void {
        this.audioEngine.beep(600, 0.1);
    }
}
