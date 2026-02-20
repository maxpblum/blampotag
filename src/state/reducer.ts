import { GameState, PHASE } from './game-state';

export type GameEvent = 
    | { type: 'TICK'; dt: number }
    | { type: 'MOVE'; dx: number; dy: number }
    | { type: 'KEY_PRESS'; key: string }
    | { type: 'NONE' };

export function rootReducer(state: GameState, event: GameEvent): GameState {
    switch (event.type) {
        case 'KEY_PRESS':
            if (state.phase === PHASE.NAME_ENTRY) {
                if (event.key === 'Enter') {
                    return { ...state, phase: PHASE.CONFIRMATION };
                }
                if (event.key === 'Backspace') {
                    const players = state.players.map((p, idx) => {
                        if (idx === state.turnIndex) {
                            return { ...p, name: p.name.slice(0, -1) };
                        }
                        return p;
                    });
                    return { ...state, players };
                }
                if (event.key.length === 1 && /[a-zA-Z0-9 ]/.test(event.key)) {
                    const players = state.players.map((p, idx) => {
                        if (idx === state.turnIndex) {
                            return { ...p, name: p.name + event.key };
                        }
                        return p;
                    });
                    return { ...state, players };
                }
            }
            if (state.phase === PHASE.CONFIRMATION && event.key === 'Enter') {
                return { ...state, phase: PHASE.PRE_GAME_COUNTDOWN, countdownTimer: 3000 };
            }
            return state;
        case 'TICK':
            if (state.phase === PHASE.PRE_GAME_COUNTDOWN) {
                const nextTimer = state.countdownTimer - event.dt;
                if (nextTimer <= 0) {
                    return { ...state, phase: PHASE.ROUND, countdownTimer: 0 };
                }
                return { ...state, countdownTimer: nextTimer };
            }
            return state;
        case 'MOVE':
            if (state.phase !== PHASE.ROUND) return state;
            const players = state.players.map((p, idx) => {
                if (idx === state.turnIndex) {
                    const nx = p.x + event.dx;
                    const ny = p.y + event.dy;
                    if (nx < 0 || nx >= state.boardConfig.width || ny < 0 || ny >= state.boardConfig.height) {
                        return p;
                    }
                    return { ...p, x: nx, y: ny };
                }
                return p;
            });
            return { ...state, players };
        default:
            return state;
    }
}
