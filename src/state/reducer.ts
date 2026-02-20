import { GameState, PHASE } from './game-state';

export type GameEvent = 
    | { type: 'TICK'; dt: number }
    | { type: 'MOVE'; dx: number; dy: number }
    | { type: 'KEY_PRESS'; key: string }
    | { type: 'NONE' };

export function rootReducer(state: GameState, event: GameEvent): GameState {
    switch (event.type) {
        case 'TICK':
            let nextState = state;
            
            // Handle transition progress
            if (state.transitionProgress < 1.0) {
                const nextProgress = Math.min(1.0, state.transitionProgress + event.dt / 1000);
                nextState = { ...nextState, transitionProgress: nextProgress };
            }

            // Handle countdown
            if (nextState.phase === PHASE.PRE_GAME_COUNTDOWN && nextState.transitionProgress >= 1.0) {
                const nextTimer = nextState.countdownTimer - event.dt;
                if (nextTimer <= 0) {
                    return transitionTo(nextState, PHASE.ROUND);
                }
                return { ...nextState, countdownTimer: nextTimer };
            }
            return nextState;

        case 'KEY_PRESS':
            if (state.transitionProgress < 1.0) return state;
            
            if (state.phase === PHASE.NAME_ENTRY) {
                if (event.key === 'Enter') {
                    return transitionTo(state, PHASE.CONFIRMATION);
                }
                if (event.key === 'Backspace') {
                    return updatePlayer(state, p => ({ ...p, name: p.name.slice(0, -1) }));
                }
                if (event.key.length === 1 && /[a-zA-Z0-9 ]/.test(event.key)) {
                    return updatePlayer(state, p => ({ ...p, name: p.name + event.key }));
                }
            }
            if (state.phase === PHASE.CONFIRMATION && event.key === 'Enter') {
                const nextPlayers = [...state.players];
                const occupied = new Set<string>();
                nextPlayers.forEach((p, i) => {
                    let nx, ny;
                    do {
                        nx = Math.floor(Math.random() * state.boardConfig.width);
                        ny = Math.floor(Math.random() * state.boardConfig.height);
                    } while (occupied.has(`${nx},${ny}`));
                    nextPlayers[i] = { ...p, x: nx, y: ny, startOfTurnX: nx, startOfTurnY: ny };
                    occupied.add(`${nx},${ny}`);
                });
                return { 
                    ...transitionTo(state, PHASE.PRE_GAME_COUNTDOWN), 
                    players: nextPlayers,
                    countdownTimer: 3000 
                };
            }
            return state;

        case 'MOVE':
            if (state.phase !== PHASE.ROUND || state.transitionProgress < 1.0) return state;
            const currentPlayer = state.players[state.turnIndex];
            const nx = currentPlayer.x + event.dx;
            const ny = currentPlayer.y + event.dy;
            
            if (nx < 0 || nx >= state.boardConfig.width || ny < 0 || ny >= state.boardConfig.height) {
                return state;
            }

            const nextPlayers = state.players.map((p, idx) => {
                if (idx === state.turnIndex) {
                    return { ...p, x: nx, y: ny, startOfTurnX: p.x, startOfTurnY: p.y };
                }
                return p;
            });

            // Check collision if 'It' moved
            if (currentPlayer.isIt) {
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

function updatePlayer(state: GameState, updater: (p: any) => any): GameState {
    const players = state.players.map((p, idx) => {
        if (idx === state.turnIndex) {
            return updater(p);
        }
        return p;
    });
    return { ...state, players };
}
