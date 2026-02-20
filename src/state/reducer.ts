import { PHASE, AVAILABLE_EMOJIS } from './game-state';
import type { GameState, Player } from './game-state';

export type GameEvent = 
    | { type: 'TICK'; dt: number }
    | { type: 'MOVE'; dx: number; dy: number }
    | { type: 'KEY_PRESS'; key: string }
    | { type: 'NONE' };

export function rootReducer(state: GameState, event: GameEvent): GameState {
    switch (event.type) {
        case 'TICK':
            let nextState = state;
            
            if (state.transitionProgress < 1.0) {
                const nextProgress = Math.min(1.0, state.transitionProgress + event.dt / 1000);
                nextState = { ...nextState, transitionProgress: nextProgress };
            }

            if (nextState.phase === PHASE.PRE_GAME_COUNTDOWN && nextState.transitionProgress >= 1.0) {
                const nextTimer = nextState.countdownTimer - event.dt;
                if (nextTimer <= 0) {
                    return transitionTo(nextState, PHASE.ROUND);
                }
                return { ...nextState, countdownTimer: nextTimer };
            }

            if (nextState.phase === PHASE.CELEBRATION) {
                const nextTimer = nextState.countdownTimer - event.dt;
                if (nextTimer <= 0) {
                    return transitionTo(nextState, PHASE.RESET);
                }
                return { ...nextState, countdownTimer: nextTimer };
            }

            if (nextState.phase === PHASE.RESET) {
                return startNewRound(nextState);
            }

            if (nextState.phase === PHASE.TAGGING_WINDOW) {
                const nextTimer = nextState.countdownTimer - event.dt;
                if (nextTimer <= 0) {
                    const players = nextState.players.map((p, idx) => {
                        if (idx === nextState.turnIndex) {
                            return { ...p, x: p.startOfTurnX, y: p.startOfTurnY, isIt: true };
                        }
                        return p;
                    });
                    return { 
                        ...nextState, 
                        phase: PHASE.ROUND, 
                        players, 
                        turnIndex: (nextState.turnIndex + 1) % nextState.players.length 
                    };
                }
                return { ...nextState, countdownTimer: nextTimer };
            }
            return nextState;

        case 'KEY_PRESS':
            if (state.transitionProgress < 1.0) return state;
            
            if (state.phase === PHASE.ADD_PLAYER_NAME) {
                if (event.key === 'Enter' && state.pendingPlayerName.trim().length > 0) {
                    return { ...state, phase: PHASE.CHOOSE_PLAYER_AVATAR, avatarSelectionIndex: 0 };
                }
                if (event.key === 'Backspace') {
                    return { ...state, pendingPlayerName: state.pendingPlayerName.slice(0, -1) };
                }
                if (event.key.length === 1 && /[a-zA-Z0-9 ]/.test(event.key)) {
                    return { ...state, pendingPlayerName: state.pendingPlayerName + event.key };
                }
            }

            if (state.phase === PHASE.CHOOSE_PLAYER_AVATAR) {
                if (event.key === 'ArrowLeft') {
                    return { ...state, avatarSelectionIndex: (state.avatarSelectionIndex - 1 + AVAILABLE_EMOJIS.length) % AVAILABLE_EMOJIS.length };
                }
                if (event.key === 'ArrowRight') {
                    return { ...state, avatarSelectionIndex: (state.avatarSelectionIndex + 1) % AVAILABLE_EMOJIS.length };
                }
                if (event.key === 'Enter') {
                    const newPlayer: Player = {
                        id: crypto.randomUUID(),
                        name: state.pendingPlayerName,
                        emoji: AVAILABLE_EMOJIS[state.avatarSelectionIndex] || "👤",
                        x: 0, y: 0, startOfTurnX: 0, startOfTurnY: 0,
                        isIt: false
                    };
                    return { 
                        ...state, 
                        players: [...state.players, newPlayer],
                        phase: PHASE.CONFIRMATION,
                        pendingPlayerName: "",
                        avatarSelectionIndex: 0
                    };
                }
            }

            if (state.phase === PHASE.CONFIRMATION) {
                if (event.key === 'a' || event.key === 'A') {
                    return { ...state, phase: PHASE.ADD_PLAYER_NAME, pendingPlayerName: "" };
                }
                if (event.key === 'Enter' && state.players.length >= 2) {
                    // Randomize "It"
                    const itIndex = Math.floor(Math.random() * state.players.length);
                    const playersWithIt = state.players.map((p, i) => ({ ...p, isIt: i === itIndex }));
                    return startNewRound({ ...state, players: playersWithIt, turnIndex: 0 });
                }
                // Board config
                if (event.key === '=') return { ...state, boardConfig: { ...state.boardConfig, width: Math.min(20, state.boardConfig.width + 1) } };
                if (event.key === '-') return { ...state, boardConfig: { ...state.boardConfig, width: Math.max(4, state.boardConfig.width - 1) } };
                if (event.key === ']') return { ...state, boardConfig: { ...state.boardConfig, height: Math.min(20, state.boardConfig.height + 1) } };
                if (event.key === '[') return { ...state, boardConfig: { ...state.boardConfig, height: Math.max(4, state.boardConfig.height - 1) } };
            }

            if (state.phase === PHASE.PLAYER_SELECTION) {
                const currentPlayer = state.players[state.turnIndex];
                if (currentPlayer) {
                    const targets = state.players.filter((p, idx) => idx !== state.turnIndex && p.x === currentPlayer.x && p.y === currentPlayer.y);
                    const selectionIndex = parseInt(event.key) - 1;
                    if (selectionIndex >= 0 && selectionIndex < targets.length) {
                        const targetId = targets[selectionIndex]?.id;
                        if (targetId) {
                            const nextPlayers = state.players.map(p => ({
                                ...p,
                                isIt: p.id === targetId
                            }));
                            return { ...transitionTo(state, PHASE.CELEBRATION), players: nextPlayers, countdownTimer: 3000 };
                        }
                    }
                }
            }

            if (state.phase === PHASE.TAGGING_WINDOW && event.key === 'Enter') {
                const currentPlayer = state.players[state.turnIndex];
                if (currentPlayer) {
                    const targets = state.players.filter((p, idx) => idx !== state.turnIndex && p.x === currentPlayer.x && p.y === currentPlayer.y);
                    if (targets.length > 1) {
                        return transitionTo(state, PHASE.PLAYER_SELECTION);
                    } else if (targets.length === 1) {
                        const targetId = targets[0]?.id;
                        if (targetId) {
                            const nextPlayers = state.players.map(p => ({
                                ...p,
                                isIt: p.id === targetId
                            }));
                            return { ...transitionTo(state, PHASE.CELEBRATION), players: nextPlayers, countdownTimer: 3000 };
                        }
                    }
                }
            }
            return state;

        case 'MOVE':
            if (state.phase !== PHASE.ROUND || state.transitionProgress < 1.0) return state;
            const currentPlayerMove = state.players[state.turnIndex];
            if (!currentPlayerMove) return state;
            const nx = currentPlayerMove.x + event.dx;
            const ny = currentPlayerMove.y + event.dy;
            
            if (nx < 0 || nx >= state.boardConfig.width || ny < 0 || ny >= state.boardConfig.height) {
                return state;
            }

            const nextPlayers = state.players.map((p, idx) => {
                if (idx === state.turnIndex) {
                    return { ...p, x: nx, y: ny, startOfTurnX: p.x, startOfTurnY: p.y };
                }
                return p;
            });

            if (currentPlayerMove.isIt) {
                const collided = nextPlayers.some((p, idx) => idx !== state.turnIndex && p.x === nx && p.y === ny);
                if (collided) {
                    return { 
                        ...state, 
                        players: nextPlayers, 
                        phase: PHASE.TAGGING_WINDOW, 
                        countdownTimer: 2000 
                    };
                }
            }

            return { ...state, players: nextPlayers, turnIndex: (state.turnIndex + 1) % state.players.length };

        default:
            return state;
    }
}

function transitionTo(state: GameState, nextPhase: PHASE): GameState {
    return {
        ...state,
        oldPhase: state.phase,
        phase: nextPhase,
        transitionProgress: 0.0
    };
}

function startNewRound(state: GameState): GameState {
    const nextPlayers = [...state.players];
    const occupied = new Set<string>();
    
    // Position non-It players first
    nextPlayers.filter(p => !p.isIt).forEach((p) => {
        let nx, ny;
        do {
            nx = Math.floor(Math.random() * state.boardConfig.width);
            ny = Math.floor(Math.random() * state.boardConfig.height);
        } while (occupied.has(`${nx},${ny}`));
        
        const idx = nextPlayers.indexOf(p);
        nextPlayers[idx] = { ...p, x: nx, y: ny, startOfTurnX: nx, startOfTurnY: ny };
        occupied.add(`${nx},${ny}`);
    });

    // Position "It" last to ensure they aren't on top of anyone
    const itIndex = nextPlayers.findIndex(p => p.isIt);
    if (itIndex !== -1) {
        const itPlayer = nextPlayers[itIndex]!;
        let nx, ny;
        do {
            nx = Math.floor(Math.random() * state.boardConfig.width);
            ny = Math.floor(Math.random() * state.boardConfig.height);
        } while (occupied.has(`${nx},${ny}`));
        nextPlayers[itIndex] = { ...itPlayer, x: nx, y: ny, startOfTurnX: nx, startOfTurnY: ny };
    }

    return {
        ...transitionTo(state, PHASE.PRE_GAME_COUNTDOWN),
        players: nextPlayers,
        countdownTimer: 3000,
        turnIndex: 0
    };
}
