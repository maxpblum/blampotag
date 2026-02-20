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
                const nextProgress = Math.min(1.0, state.transitionProgress + event.dt / 1000); // 1-second transition
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
            if (state.transitionProgress < 1.0) return state; // Ignore input during transition
            
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
                    nextPlayers[i] = { ...p, x: nx, y: ny };
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
            return updatePlayer(state, p => {
                const nx = p.x + event.dx;
                const ny = p.y + event.dy;
                if (nx < 0 || nx >= state.boardConfig.width || ny < 0 || ny >= state.boardConfig.height) {
                    return p;
                }
                return { ...p, x: nx, y: ny };
            });

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
