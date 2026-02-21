import { AudioEngine } from "./audio-engine";

export interface AudioEffectPlayer {
    playMove(): void;
    playFanfare(): void;
    playTag(): void;
    playSelect(): void;
    playSetupMusic(): void;
    playGameMusic(): void;
    playTensionMusic(): void;
    stopMusic(): void;
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

    public playSetupMusic(): void {
        const notes = [
            { freq: 261.63, duration: 0.5 }, { freq: 329.63, duration: 0.5 }, { freq: 392.00, duration: 0.5 }, { freq: 523.25, duration: 0.5 },
            { freq: 440.00, duration: 0.5 }, { freq: 349.23, duration: 0.5 }, { freq: 293.66, duration: 1.0 }
        ];
        this.audioEngine.playSequence(notes, 120);
    }

    public playGameMusic(): void {
        const notes = [
            { freq: 110.00, duration: 0.25 }, { freq: 110.00, duration: 0.25 }, { freq: 220.00, duration: 0.5 },
            { freq: 130.81, duration: 0.25 }, { freq: 130.81, duration: 0.25 }, { freq: 261.63, duration: 0.5 },
            { freq: 146.83, duration: 0.25 }, { freq: 146.83, duration: 0.25 }, { freq: 293.66, duration: 0.5 },
            { freq: 123.47, duration: 0.5 }, { freq: 164.81, duration: 0.5 }
        ];
        this.audioEngine.playSequence(notes, 140);
    }

    public playTensionMusic(): void {
        const notes = [
            { freq: 880.00, duration: 0.25 }, { freq: 0, duration: 0.25 },
            { freq: 880.00, duration: 0.25 }, { freq: 0, duration: 0.25 },
            { freq: 932.33, duration: 0.25 }, { freq: 0, duration: 0.25 },
            { freq: 932.33, duration: 0.25 }, { freq: 0, duration: 0.25 }
        ];
        this.audioEngine.playSequence(notes, 160);
    }

    public stopMusic(): void {
        this.audioEngine.stopSequence();
    }
}
