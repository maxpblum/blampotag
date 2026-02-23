import { PHASE, AVAILABLE_EMOJIS } from "../state/game-state";
import type { GameState } from "../state/game-state";
import { MOVE_KEYS } from "../state/reducer";
import { renderToContainer, createBuffer, drawBox, writeStringToBuffer, writeOverlayToBuffer } from "../dos-themed-rendering/buffer-renderer";
import type { CharacterBuffer } from "../dos-themed-rendering/buffer-renderer";
import { TITLE_ART, COUNTDOWN_ART } from "../dos-themed-rendering/ascii-assets";
import { getBlockyWipeBuffer } from "../dos-themed-rendering/transitions";
import { overlayHearts, overlayRainbow } from "../dos-themed-rendering/animations";
import type { AudioEffectPlayer } from "../audio/game-audio";

const GRID_CELL_WIDTH = 8;
const GRID_CELL_HEIGHT = 3;

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
        if (!previousState) {
            this.updateMusic(state.phase);
            return;
        }

        // Check for phase transitions
        if (state.phase !== previousState.phase) {
            this.updateMusic(state.phase);
            if (state.phase === PHASE.CELEBRATION) {
                this.audio.playFanfare();
            } else if (state.phase === PHASE.TAGGING_WINDOW) {
                this.audio.playTag();
            } else if (state.phase === PHASE.CHOOSE_PLAYER_AVATAR || state.phase === PHASE.ADD_PLAYER_NAME) {
                this.audio.playSelect();
            }
        }

        const playerMoved = state.players.some((p, i) => {
            const prevP = previousState.players[i];
            return prevP && (p.x !== prevP.x || p.y !== prevP.y);
        });

        if (playerMoved) {
            this.audio.playMove();
        }
    }

    private currentMusicType: string | null = null;
    private updateMusic(phase: PHASE): void {
        let nextMusicType: string | null = null;
        switch (phase) {
            case PHASE.ADD_PLAYER_NAME:
            case PHASE.CHOOSE_PLAYER_AVATAR:
            case PHASE.CONFIRMATION:
                nextMusicType = "SETUP";
                break;
            case PHASE.PRE_GAME_COUNTDOWN:
            case PHASE.TAGGING_WINDOW:
            case PHASE.PLAYER_SELECTION:
                nextMusicType = "TENSION";
                break;
            case PHASE.ROUND:
                nextMusicType = "GAME";
                break;
            case PHASE.CELEBRATION:
            case PHASE.RESET:
                nextMusicType = "STOP";
                break;
        }

        if (nextMusicType === this.currentMusicType) return;
        this.currentMusicType = nextMusicType;

        switch (nextMusicType) {
            case "SETUP":
                this.audio.playSetupMusic();
                break;
            case "TENSION":
                this.audio.playTensionMusic();
                break;
            case "GAME":
                this.audio.playGameMusic();
                break;
            case "STOP":
                this.audio.stopMusic();
                break;
        }
    }

    private getCellBackgroundColor(gx: number, gy: number, state: GameState): string {
        const isDark = (gx + gy) % 2 === 1;
        
        // Highlight current turn player's square (overrides others)
        const currentPlayer = state.players[state.turnIndex];
        if (currentPlayer && currentPlayer.x === gx && currentPlayer.y === gy && state.phase === PHASE.ROUND) {
            return "var(--vga-bright-green)";
        }

        // Highlight "It" player's square
        const itPlayer = state.players.find(p => p.isIt);
        if (itPlayer && itPlayer.x === gx && itPlayer.y === gy) {
            return "var(--vga-brown)"; // A dark red/orangeish color
        }

        // Highlight last move "from" and "to"
        if (state.lastMove) {
            if (state.lastMove.fromX === gx && state.lastMove.fromY === gy) {
                return "var(--vga-blue)";
            }
            if (state.lastMove.toX === gx && state.lastMove.toY === gy) {
                return "var(--vga-bright-blue)";
            }
        }

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
            
            const usedEmojis = new Set(players.map(p => p.emoji));
            const emojiRow = AVAILABLE_EMOJIS.map((e, i) => {
                if (usedEmojis.has(e)) return " X ";
                return i === avatarSelectionIndex ? `[${e}]` : ` ${e} `;
            }).join(" ");
            buffer = writeStringToBuffer(buffer, emojiRow, getCenterX(emojiRow), 16, "var(--vga-white)", "var(--vga-black)", "1.5em");
            
            const controlsText = "Use 'A'/'D' to pick, ENTER to confirm";
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
            const boardX = Math.floor((bufferWidth - boardCharWidth) / 2); 
            const boardY = 10;
            
            // Draw board border
            buffer = drawBox(buffer, boardX - 1, boardY - 1, boardCharWidth + 2, boardCharHeight + 2, "var(--vga-light-gray)");
            
            // Draw checkerboard and highlights
            for (let gy = 0; gy < boardConfig.height; gy++) {
                for (let gx = 0; gx < boardConfig.width; gx++) {
                    const bgColor = this.getCellBackgroundColor(gx, gy, state);
                    
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
                
                const bgColor = this.getCellBackgroundColor(player.x, player.y, state);
                
                // Center emoji in cell
                const px = boardX + player.x * GRID_CELL_WIDTH + Math.floor((GRID_CELL_WIDTH - 2) / 2);
                const py = boardY + player.y * GRID_CELL_HEIGHT + Math.floor((GRID_CELL_HEIGHT - 1) / 2);
                // Make emojis much bigger
                buffer = writeStringToBuffer(buffer, player.emoji, px, py, color, bgColor, "2.2em");
            });

            const currentPlayer = players[turnIndex];
            
            // Key Overlays
            if (phase === PHASE.ROUND && currentPlayer) {
                Object.entries(MOVE_KEYS).forEach(([key, move]) => {
                    if (move.dist === 2 && currentPlayer.moveCount !== 0) return;

                    const tx = currentPlayer.x + move.dx * move.dist;
                    const ty = currentPlayer.y + move.dy * move.dist;

                    if (tx >= 0 && tx < boardConfig.width && ty >= 0 && ty < boardConfig.height) {
                        const px = boardX + tx * GRID_CELL_WIDTH + Math.floor((GRID_CELL_WIDTH - 1) / 2);
                        const py = boardY + ty * GRID_CELL_HEIGHT + Math.floor((GRID_CELL_HEIGHT - 1) / 2);
                        const isTwoSpace = move.dist === 2;
                        const bgColor = isTwoSpace ? "var(--vga-magenta)" : "var(--vga-blue)";
                        buffer = writeOverlayToBuffer(buffer, key.toUpperCase(), px, py, "var(--vga-bright-white)", bgColor, "1.5em");
                    }
                });
            }

            const statusY = boardY + boardCharHeight + 4;

            if (phase === PHASE.TAGGING_WINDOW) {
                const text1 = "!!! TAG !!!";
                const text2 = "PRESS ENTER!";
                const text3 = `TIME: ${(countdownTimer/1000).toFixed(1)}s`;
                buffer = writeStringToBuffer(buffer, text1, getCenterX(text1), statusY, "var(--vga-bright-red)", "var(--vga-black)", "1.8em");
                buffer = writeStringToBuffer(buffer, text2, getCenterX(text2), statusY + 2, "var(--vga-bright-yellow)", "var(--vga-black)", "1.8em");
                buffer = writeStringToBuffer(buffer, text3, getCenterX(text3), statusY + 4);
            } else if (phase === PHASE.PLAYER_SELECTION && currentPlayer) {
                const text1 = "CHOOSE TARGET:";
                buffer = writeStringToBuffer(buffer, text1, getCenterX(text1), statusY, "var(--vga-bright-cyan)", "var(--vga-black)", "1.8em");
                                    const targets = players.filter((p, idx) => idx !== turnIndex && p.x === currentPlayer.x && p.y === currentPlayer.y);
                                    targets.forEach((p, i) => {
                                        const playerText = `${i + 1}: ${p.emoji} ${p.name}`;
                                        buffer = writeStringToBuffer(buffer, playerText, getCenterX(playerText), statusY + 2 + i, "var(--vga-white)", "var(--vga-black)", "1.8em");
                                    });
                                } else if (currentPlayer && phase === PHASE.ROUND) {                const text1 = "CURRENT TURN:";
                const text2 = `${currentPlayer.emoji} ${currentPlayer.name}`;
                buffer = writeStringToBuffer(buffer, text1, getCenterX(text1), statusY, "var(--vga-bright-green)", "var(--vga-black)", "1.8em");
                buffer = writeStringToBuffer(buffer, text2, getCenterX(text2), statusY + 2, "var(--vga-white)", "var(--vga-black)", "1.8em");
                if (currentPlayer.isIt) {
                    const text3 = "YOU ARE IT!";
                    buffer = writeStringToBuffer(buffer, text3, getCenterX(text3), statusY + 4, "var(--vga-bright-red)", "var(--vga-black)", "1.8em");
                }
            } else if (phase === PHASE.CELEBRATION) {
                const text1 = "SUCCESSFUL TAG!";
                buffer = writeStringToBuffer(buffer, text1, getCenterX(text1), statusY, "var(--vga-bright-magenta)", "var(--vga-black)", "1.8em");
            }
        }
        
        return buffer;
    }
}
