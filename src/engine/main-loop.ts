import { GameState, PHASE } from "../state/game-state";
import { rootReducer, GameEvent } from "../state/reducer";
import { renderToContainer, createBuffer, drawBox, writeStringToBuffer } from "../dos-themed-rendering/buffer-renderer";
import { KeyboardManager } from "../input-and-time-event-logic/keyboard";
import { TITLE_ART, COUNTDOWN_ART } from "../dos-themed-rendering/ascii-assets";
import { AudioEngine } from "../audio/audio-engine";

export class MainLoop {
    private state: GameState;
    private lastTimestamp: number = 0;
    private readonly keyboard: KeyboardManager;
    private readonly audio: AudioEngine;

    constructor(
        initialState: GameState,
        private readonly container: HTMLElement
    ) {
        this.state = initialState;
        this.audio = new AudioEngine();
        this.keyboard = new KeyboardManager(this.onKeyPress);
    }

    public start(): void {
        requestAnimationFrame(this.loop);
    }

    private readonly onKeyPress = (key: string): void => {
        this.audio.init();
        this.update({ type: "KEY_PRESS", key });
        switch (key) {
            case "ArrowUp": this.update({ type: "MOVE", dx: 0, dy: -1 }); this.audio.beep(400); break;
            case "ArrowDown": this.update({ type: "MOVE", dx: 0, dy: 1 }); this.audio.beep(400); break;
            case "ArrowLeft": this.update({ type: "MOVE", dx: -1, dy: 0 }); this.audio.beep(400); break;
            case "ArrowRight": this.update({ type: "MOVE", dx: 1, dy: 0 }); this.audio.beep(400); break;
        }
    };

    private readonly loop = (timestamp: number): void => {
        const dt = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;

        this.update({ type: "TICK", dt });
        this.render();

        requestAnimationFrame(this.loop);
    };

    private update(event: GameEvent): void {
        this.state = rootReducer(this.state, event);
    }

    private render(): void {
        const { phase, boardConfig, players, turnIndex } = this.state;
        let buffer = createBuffer(80, 25);
        
        // Render Title
        buffer = writeStringToBuffer(buffer, TITLE_ART.join("\n"), 1, 1);
        
        if (phase === PHASE.NAME_ENTRY) {
            const currentPlayer = players[turnIndex];
            buffer = writeStringToBuffer(buffer, "PLAYER NAME ENTRY", 31, 10);
            buffer = writeStringToBuffer(buffer, "-----------------", 31, 11);
            buffer = writeStringToBuffer(buffer, `Name: ${currentPlayer.name}_`, 31, 13);
            buffer = writeStringToBuffer(buffer, "Press ENTER when done", 29, 15);
        } else if (phase === PHASE.CONFIRMATION) {
            buffer = writeStringToBuffer(buffer, "START THE GAME?", 32, 10);
            buffer = writeStringToBuffer(buffer, "---------------", 32, 11);
            players.forEach((p, i) => {
                buffer = writeStringToBuffer(buffer, `${p.emoji} ${p.name}`, 32, 13 + i);
            });
            buffer = writeStringToBuffer(buffer, "Press ENTER to start", 30, 15 + players.length);
        } else if (phase === PHASE.PRE_GAME_COUNTDOWN) {
            const count = Math.ceil(this.state.countdownTimer / 1000);
            const art = COUNTDOWN_ART[count] || "";
            buffer = writeStringToBuffer(buffer, art, 35, 10);
        } else {
            const boardX = 35;
            const boardY = 10;
            // Draw board border
            buffer = drawBox(buffer, boardX, boardY, boardConfig.width + 2, boardConfig.height + 2);
            
            // Render players
            players.forEach(player => {
                buffer = writeStringToBuffer(buffer, player.emoji, boardX + player.x + 1, boardY + player.y + 1);
            });
        }
        
        renderToContainer(buffer, this.container);
    }
}
