import { PHASE } from "../state/game-state";
import type { GameState } from "../state/game-state";
import { rootReducer } from "../state/reducer";
import type { GameEvent } from "../state/reducer";
import { renderToContainer, createBuffer, drawBox, writeStringToBuffer } from "../dos-themed-rendering/buffer-renderer";
import type { CharacterBuffer } from "../dos-themed-rendering/buffer-renderer";
import { KeyboardManager } from "../input-and-time-event-logic/keyboard";
import { TITLE_ART, COUNTDOWN_ART } from "../dos-themed-rendering/ascii-assets";
import { AudioEngine } from "../audio/audio-engine";
import { getBlockyWipeBuffer } from "../dos-themed-rendering/transitions";
import { overlayHearts, overlayRainbow } from "../dos-themed-rendering/animations";

export class MainLoop {
    private state: GameState;
    private lastTimestamp: number = 0;
    private totalTime: number = 0;
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
            case "q": this.update({ type: "MOVE", dx: -1, dy: -1 }); this.audio.beep(400); break;
            case "e": this.update({ type: "MOVE", dx: 1, dy: -1 }); this.audio.beep(400); break;
            case "z": this.update({ type: "MOVE", dx: -1, dy: 1 }); this.audio.beep(400); break;
            case "c": this.update({ type: "MOVE", dx: 1, dy: 1 }); this.audio.beep(400); break;
        }
    };

    private readonly loop = (timestamp: number): void => {
        const dt = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;
        this.totalTime += dt;

        this.update({ type: "TICK", dt });
        this.render();

        requestAnimationFrame(this.loop);
    };

    private update(event: GameEvent): void {
        const previousPhase = this.state.phase;
        this.state = rootReducer(this.state, event);
        if (this.state.phase === PHASE.CELEBRATION && previousPhase !== PHASE.CELEBRATION) {
            this.audio.fanfare();
        }
    }

    private render(): void {
        let currentBuffer = this.renderPhase(this.state.phase, this.state);

        if (this.state.phase === PHASE.CELEBRATION) {
            currentBuffer = overlayRainbow(currentBuffer, this.totalTime);
            currentBuffer = overlayHearts(currentBuffer, this.totalTime);
        }

        if (this.state.transitionProgress < 1.0 && this.state.oldPhase) {
            const oldBuffer = this.renderPhase(this.state.oldPhase, this.state);
            const blended = getBlockyWipeBuffer(oldBuffer, currentBuffer, this.state.transitionProgress);
            renderToContainer(blended, this.container);
        } else {
            renderToContainer(currentBuffer, this.container);
        }
    }

    private renderPhase(phase: PHASE, state: GameState): CharacterBuffer {
        const { boardConfig, players, turnIndex, countdownTimer } = state;
        let buffer = createBuffer(80, 25);
        
        buffer = writeStringToBuffer(buffer, TITLE_ART.join("\n"), 1, 1);
        
        if (phase === PHASE.NAME_ENTRY) {
            const currentPlayer = players[turnIndex];
            buffer = writeStringToBuffer(buffer, "PLAYER NAME ENTRY", 31, 10);
            buffer = writeStringToBuffer(buffer, "-----------------", 31, 11);
            buffer = writeStringToBuffer(buffer, `Name: ${currentPlayer?.name || ""}_`, 31, 13);
            buffer = writeStringToBuffer(buffer, "Press ENTER when done", 29, 15);
        } else if (phase === PHASE.CONFIRMATION) {
            buffer = writeStringToBuffer(buffer, "START THE GAME?", 32, 10);
            buffer = writeStringToBuffer(buffer, "---------------", 32, 11);
            players.forEach((p, i) => {
                buffer = writeStringToBuffer(buffer, `${p.emoji} ${p.name}`, 32, 13 + i);
            });
            buffer = writeStringToBuffer(buffer, "Press ENTER to start", 30, 15 + players.length);
        } else if (phase === PHASE.PRE_GAME_COUNTDOWN) {
            const count = Math.ceil(countdownTimer / 1000);
            const art = COUNTDOWN_ART[count] || "";
            buffer = writeStringToBuffer(buffer, art, 35, 10);
        } else if (phase === PHASE.ROUND || phase === PHASE.TAGGING_WINDOW || phase === PHASE.PLAYER_SELECTION) {
            const boardX = 35;
            const boardY = 10;
            buffer = drawBox(buffer, boardX, boardY, boardConfig.width + 2, boardConfig.height + 2);
            
            players.forEach((player, idx) => {
                let color = "var(--vga-light-gray)";
                if (player.isIt) color = "var(--vga-bright-red)";
                else if (idx === turnIndex) color = "var(--vga-bright-green)";
                
                buffer = writeStringToBuffer(buffer, player.emoji, boardX + player.x + 1, boardY + player.y + 1, color);
            });

            const currentPlayer = players[turnIndex];
            if (phase === PHASE.TAGGING_WINDOW) {
                buffer = writeStringToBuffer(buffer, "PRESS ENTER TO TAG!", 31, 22, "var(--vga-bright-yellow)");
                buffer = writeStringToBuffer(buffer, `Time: ${(countdownTimer/1000).toFixed(1)}s`, 35, 23);
            } else if (phase === PHASE.PLAYER_SELECTION && currentPlayer) {
                const targets = players.filter((p, idx) => idx !== turnIndex && p.x === currentPlayer.x && p.y === currentPlayer.y);
                buffer = writeStringToBuffer(buffer, "CHOOSE TARGET:", 32, 21, "var(--vga-bright-cyan)");
                targets.forEach((p, i) => {
                    buffer = writeStringToBuffer(buffer, `${i + 1}: ${p.emoji} ${p.name}`, 32, 22 + i);
                });
            } else if (currentPlayer) {
                buffer = writeStringToBuffer(buffer, `TURN: ${currentPlayer.name}`, 32, 22, "var(--vga-bright-green)");
            }
        }
        
        return buffer;
    }
}
