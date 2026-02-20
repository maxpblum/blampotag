/// <reference types="jasmine" />
import { rootReducer } from './reducer';
import { PHASE } from './game-state';
import type { GameState } from './game-state';

describe('rootReducer', () => {
    it('should return the same state when no events are handled', () => {
        const initialState: GameState = {
            phase: PHASE.NAME_ENTRY,
            players: [],
            turnIndex: 0,
            boardConfig: { width: 10, height: 10 },
            countdownTimer: 0,
            transitionProgress: 1.0,
            oldPhase: null
        };
        const nextState = rootReducer(initialState, { type: 'NONE' });
        expect(nextState).toBe(initialState);
    });
});
