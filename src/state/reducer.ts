import { GameState } from './game-state';

export type GameEvent = 
    | { type: 'TICK'; dt: number }
    | { type: 'NONE' };

export function rootReducer(state: GameState, event: GameEvent): GameState {
    switch (event.type) {
        case 'TICK':
            // Logic for time passing, e.g. updating transition progress
            return state;
        default:
            return state;
    }
}
