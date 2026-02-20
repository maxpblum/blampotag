import { PHASE, AVAILABLE_EMOJIS } from "../state/game-state";
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

const GRID_CELL_WIDTH = 4;
const GRID_CELL_HEIGHT = 2;

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

    /**
     * Returns the current state of the game.
     * Primarily used for E2E testing to verify internal logic.
     */
    public getState(): GameState {
        return this.state;
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
        const { boardConfig, players, turnIndex, countdownTimer, pendingPlayerName, avatarSelectionIndex } = state;
        const bufferWidth = 100;
        const bufferHeight = 45;
        let buffer = createBuffer(bufferWidth, bufferHeight);
        
        const getCenterX = (text: string) => {
            const lines = text.split("\n");
            const maxWidth = Math.max(...lines.map(l => l.length));
            return Math.floor((bufferWidth - maxWidth) / 2);
        };

        // Render Title with buffer space
        const titleStr = TITLE_ART.join("\n");
        buffer = writeStringToBuffer(buffer, titleStr, getCenterX(titleStr), 2, "var(--vga-bright-cyan)");
        
        if (phase === PHASE.ADD_PLAYER_NAME) {
            const setupText = `PLAYER ${players.length + 1} SETUP`;
            buffer = writeStringToBuffer(buffer, setupText, getCenterX(setupText), 12, "var(--vga-yellow)");
            const underline = "-----------------";
            buffer = writeStringToBuffer(buffer, underline, getCenterX(underline), 13);
            const nameInput = `Enter Name: ${pendingPlayerName}_`;
            buffer = writeStringToBuffer(buffer, nameInput, getCenterX(nameInput), 15, "var(--vga-white)");
            const enterDone = "Press ENTER when done";
            buffer = writeStringToBuffer(buffer, enterDone, getCenterX(enterDone), 18);
        } else if (phase === PHASE.CHOOSE_PLAYER_AVATAR) {
            const chooseText = `CHOOSE AVATAR FOR ${pendingPlayerName.toUpperCase()}`;
            buffer = writeStringToBuffer(buffer, chooseText, getCenterX(chooseText), 12, "var(--vga-yellow)");
            const underline = "---------------------------------";
            buffer = writeStringToBuffer(buffer, underline, getCenterX(underline), 13);
            
            const emojiRow = AVAILABLE_EMOJIS.map((e, i) => i === avatarSelectionIndex ? `[${e}]` : ` ${e} `).join(" ");
            buffer = writeStringToBuffer(buffer, emojiRow, getCenterX(emojiRow), 16);
            
            const controlsText = "Use ARROWS to pick, ENTER to confirm";
            buffer = writeStringToBuffer(buffer, controlsText, getCenterX(controlsText), 19);
        } else if (phase === PHASE.CONFIRMATION) {
            const configText = "GAME CONFIGURATION";
            buffer = writeStringToBuffer(buffer, configText, getCenterX(configText), 12, "var(--vga-yellow)");
            const underline = "------------------";
            buffer = writeStringToBuffer(buffer, underline, getCenterX(underline), 13);
            
            players.forEach((p, i) => {
                const playerText = `${p.emoji} ${p.name}`;
                buffer = writeStringToBuffer(buffer, playerText, getCenterX(playerText), 15 + i);
            });
            
            const nextY = 16 + players.length;
            const boardSizeText = `Board Size: ${boardConfig.width}x${boardConfig.height}`;
            buffer = writeStringToBuffer(buffer, boardSizeText, getCenterX(boardSizeText), nextY, "var(--vga-bright-green)");
            const adjustText = "Adjust: Width (+/-) Height ([/])";
            buffer = writeStringToBuffer(buffer, adjustText, getCenterX(adjustText), nextY + 1, "var(--vga-dark-gray)");
            
            const addText = "'A' to Add Player";
            buffer = writeStringToBuffer(buffer, addText, getCenterX(addText), nextY + 3, "var(--vga-bright-cyan)");
            if (players.length >= 2) {
                const startText = "Press ENTER to START";
                buffer = writeStringToBuffer(buffer, startText, getCenterX(startText), nextY + 4, "var(--vga-bright-magenta)");
            } else {
                const minPlayersText = "(Need at least 2 players)";
                buffer = writeStringToBuffer(buffer, minPlayersText, getCenterX(minPlayersText), nextY + 4, "var(--vga-red)");
            }
        } else if (phase === PHASE.PRE_GAME_COUNTDOWN) {
            const count = Math.ceil(countdownTimer / 1000);
            const art = COUNTDOWN_ART[count] || "";
            buffer = writeStringToBuffer(buffer, art, getCenterX(art), 15, "var(--vga-bright-yellow)");
        } else if (phase === PHASE.ROUND || phase === PHASE.TAGGING_WINDOW || phase === PHASE.PLAYER_SELECTION || phase === PHASE.CELEBRATION || phase === PHASE.RESET) {
            const boardCharWidth = boardConfig.width * GRID_CELL_WIDTH;
            const boardCharHeight = boardConfig.height * GRID_CELL_HEIGHT;
            const boardX = Math.floor((bufferWidth - (boardCharWidth + 20)) / 2); // Center board with side info area
            const boardY = 12;
            
            // Draw board border
            buffer = drawBox(buffer, boardX - 1, boardY - 1, boardCharWidth + 2, boardCharHeight + 2, "var(--vga-light-gray)");
            
            // Draw checkerboard
            for (let gy = 0; gy < boardConfig.height; gy++) {
                for (let gx = 0; gx < boardConfig.width; gx++) {
                    const isDark = (gx + gy) % 2 === 1;
                    const color = isDark ? "var(--vga-dark-gray)" : "var(--vga-light-gray)";
                    const char = isDark ? " " : "·";
                    
                    for (let cy = 0; cy < GRID_CELL_HEIGHT; cy++) {
                        for (let cx = 0; cx < GRID_CELL_WIDTH; cx++) {
                            buffer = writeStringToBuffer(buffer, char, boardX + gx * GRID_CELL_WIDTH + cx, boardY + gy * GRID_CELL_HEIGHT + cy, color);
                        }
                    }
                }
            }
            
            players.forEach((player, idx) => {
                let color = "var(--vga-white)";
                if (player.isIt) color = "var(--vga-bright-red)";
                else if (idx === turnIndex && phase === PHASE.ROUND) color = "var(--vga-bright-green)";
                
                // Center emoji in cell
                const px = boardX + player.x * GRID_CELL_WIDTH + Math.floor((GRID_CELL_WIDTH - 2) / 2);
                const py = boardY + player.y * GRID_CELL_HEIGHT + Math.floor((GRID_CELL_HEIGHT - 1) / 2);
                buffer = writeStringToBuffer(buffer, player.emoji, px, py, color);
            });

            const currentPlayer = players[turnIndex];
            if (phase === PHASE.TAGGING_WINDOW) {
                buffer = writeStringToBuffer(buffer, "!!! TAG !!!", boardX + boardCharWidth + 4, boardY, "var(--vga-bright-red)");
                buffer = writeStringToBuffer(buffer, "PRESS ENTER!", boardX + boardCharWidth + 4, boardY + 1, "var(--vga-bright-yellow)");
                buffer = writeStringToBuffer(buffer, `TIME: ${(countdownTimer/1000).toFixed(1)}s`, boardX + boardCharWidth + 4, boardY + 3);
            } else if (phase === PHASE.PLAYER_SELECTION && currentPlayer) {
                buffer = writeStringToBuffer(buffer, "CHOOSE TARGET:", boardX + boardCharWidth + 4, boardY, "var(--vga-bright-cyan)");
                const targets = players.filter((p, idx) => idx !== turnIndex && p.x === currentPlayer.x && p.y === currentPlayer.y);
                targets.forEach((p, i) => {
                    buffer = writeStringToBuffer(buffer, `${i + 1}: ${p.emoji} ${p.name}`, boardX + boardCharWidth + 4, boardY + 2 + i);
                });
            } else if (currentPlayer && phase === PHASE.ROUND) {
                buffer = writeStringToBuffer(buffer, "CURRENT TURN:", boardX + boardCharWidth + 4, boardY, "var(--vga-bright-green)");
                buffer = writeStringToBuffer(buffer, `${currentPlayer.emoji} ${currentPlayer.name}`, boardX + boardCharWidth + 4, boardY + 1);
                if (currentPlayer.isIt) {
                    buffer = writeStringToBuffer(buffer, "YOU ARE IT!", boardX + boardCharWidth + 4, boardY + 3, "var(--vga-bright-red)");
                }
            } else if (phase === PHASE.CELEBRATION) {
                buffer = writeStringToBuffer(buffer, "SUCCESSFUL TAG!", boardX + boardCharWidth + 4, boardY, "var(--vga-bright-magenta)");
            }
        }
        
        return buffer;
    }
}
