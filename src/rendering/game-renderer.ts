import { PHASE, AVAILABLE_EMOJIS } from "../state/game-state";
import type { GameState } from "../state/game-state";
import { renderToContainer, createBuffer, drawBox, writeStringToBuffer } from "../dos-themed-rendering/buffer-renderer";
import type { CharacterBuffer } from "../dos-themed-rendering/buffer-renderer";
import { TITLE_ART, COUNTDOWN_ART } from "../dos-themed-rendering/ascii-assets";
import { getBlockyWipeBuffer } from "../dos-themed-rendering/transitions";
import { overlayHearts, overlayRainbow } from "../dos-themed-rendering/animations";
import type { AudioEffectPlayer } from "../audio/game-audio";

const GRID_CELL_WIDTH = 4;
const GRID_CELL_HEIGHT = 2;

export class GameRenderer {
    constructor(
        private readonly container: HTMLElement,
        private readonly audio: AudioEffectPlayer
    ) {}

    public initAudio(): void {
        this.audio.init();
    }

    public render(state: GameState, previousState: GameState | null, totalTime: number): void {
        this.triggerAudioEffects(state, previousState);

        let currentBuffer = this.renderPhase(state.phase, state);

        if (state.phase === PHASE.CELEBRATION) {
            currentBuffer = overlayRainbow(currentBuffer, totalTime);
            currentBuffer = overlayHearts(currentBuffer, totalTime);
        }

        if (state.transitionProgress < 1.0 && state.oldPhase) {
            const oldBuffer = this.renderPhase(state.oldPhase, state);
            const blended = getBlockyWipeBuffer(oldBuffer, currentBuffer, state.transitionProgress);
            renderToContainer(blended, this.container);
        } else {
            renderToContainer(currentBuffer, this.container);
        }
    }

    private triggerAudioEffects(state: GameState, previousState: GameState | null): void {
        if (!previousState) return;

        // Check for phase transitions
        if (state.phase !== previousState.phase) {
            if (state.phase === PHASE.CELEBRATION) {
                this.audio.playFanfare();
            } else if (state.phase === PHASE.TAGGING_WINDOW) {
                this.audio.playTag();
            } else if (state.phase === PHASE.CHOOSE_PLAYER_AVATAR || state.phase === PHASE.ADD_PLAYER_NAME) {
                this.audio.playSelect();
            }
        }

        // Check for movement (assuming turnIndex changes or coordinates change)
        // This is a bit complex as state alone doesn't directly tell us a move happened,
        // but comparing coordinates of players might.
        // For simplicity, let's compare turnIndex or coordinates.
        // Actually, the main-loop had audio.beep(400) on movement.
        // We can check if any player moved.
        const playerMoved = state.players.some((p, i) => {
            const prevP = previousState.players[i];
            return prevP && (p.x !== prevP.x || p.y !== prevP.y);
        });

        if (playerMoved) {
            this.audio.playMove();
        }
    }

    private getCellBackgroundColor(gx: number, gy: number): string {
        const isDark = (gx + gy) % 2 === 1;
        return isDark ? "var(--vga-black)" : "var(--vga-dark-gray)";
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
        } else if (phase === PHASE.ROUND || phase === PHASE.TAGGING_WINDOW || phase === PHASE.PLAYER_SELECTION || phase === PHASE.CELEBRATION || phase === PHASE.RESET || phase === PHASE.FIRST_TURN_PROMPT) {
            const boardCharWidth = boardConfig.width * GRID_CELL_WIDTH;
            const boardCharHeight = boardConfig.height * GRID_CELL_HEIGHT;
            const boardX = Math.floor((bufferWidth - (boardCharWidth + 20)) / 2); // Center board with side info area
            const boardY = 12;
            
            // Draw board border
            buffer = drawBox(buffer, boardX - 1, boardY - 1, boardCharWidth + 2, boardCharHeight + 2, "var(--vga-light-gray)");
            
            // Draw checkerboard
            for (let gy = 0; gy < boardConfig.height; gy++) {
                for (let gx = 0; gx < boardConfig.width; gx++) {
                    const bgColor = this.getCellBackgroundColor(gx, gy);
                    
                    for (let cy = 0; cy < GRID_CELL_HEIGHT; cy++) {
                        for (let cx = 0; cx < GRID_CELL_WIDTH; cx++) {
                            buffer = writeStringToBuffer(buffer, " ", boardX + gx * GRID_CELL_WIDTH + cx, boardY + gy * GRID_CELL_HEIGHT + cy, "var(--vga-white)", bgColor);
                        }
                    }
                }
            }
            
            players.forEach((player, idx) => {
                let color = "var(--vga-white)";
                if (player.isIt) color = "var(--vga-bright-red)";
                else if (idx === turnIndex && phase === PHASE.ROUND) color = "var(--vga-bright-green)";
                
                const bgColor = this.getCellBackgroundColor(player.x, player.y);
                
                // Center emoji in cell
                const px = boardX + player.x * GRID_CELL_WIDTH + Math.floor((GRID_CELL_WIDTH - 2) / 2);
                const py = boardY + player.y * GRID_CELL_HEIGHT + Math.floor((GRID_CELL_HEIGHT - 1) / 2);
                buffer = writeStringToBuffer(buffer, player.emoji, px, py, color, bgColor);
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
            } else if (phase === PHASE.FIRST_TURN_PROMPT && currentPlayer) {
                buffer = writeStringToBuffer(buffer, "FIRST TURN PERK!", boardX + boardCharWidth + 4, boardY, "var(--vga-bright-yellow)");
                buffer = writeStringToBuffer(buffer, "MOVE 2 SPACES?", boardX + boardCharWidth + 4, boardY + 1, "var(--vga-white)");
                buffer = writeStringToBuffer(buffer, "PRESS Y / N", boardX + boardCharWidth + 4, boardY + 3, "var(--vga-bright-green)");
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
