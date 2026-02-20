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
