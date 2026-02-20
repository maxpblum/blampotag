import { rootReducer } from './reducer';

describe('rootReducer', () => {
    it('should return the same state when no events are handled', () => {
        const initialState = { some: 'state' };
        const nextState = rootReducer(initialState, { type: 'NONE' });
        expect(nextState).toBe(initialState);
    });
});
