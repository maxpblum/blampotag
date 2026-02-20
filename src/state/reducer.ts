import { GameState } from './game-state';

export type GameEvent = 
    | { type: 'TICK'; dt: number }
    | { type: 'MOVE'; dx: number; dy: number }
    | { type: 'NONE' };

export function rootReducer(state: GameState, event: GameEvent): GameState {
    switch (event.type) {
        case 'TICK':
            return state;
        case 'MOVE':
            const players = state.players.map((p, idx) => {
                if (idx === state.turnIndex) {
                    return { ...p, x: p.x + event.dx, y: p.y + event.dy };
                }
                return p;
            });
            return { ...state, players };
        default:
            return state;
    }
}
