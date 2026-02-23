/// <reference types="jasmine" />
import { rootReducer } from './reducer';
import { PHASE, AVAILABLE_EMOJIS } from './game-state';
import type { GameState, Player } from './game-state';

describe('rootReducer', () => {
    const DEFAULT_BOARD = { width: 10, height: 10 };
    const PLAYER_1: Player = { id: '1', name: 'Alice', emoji: '🧙', x: 2, y: 2, startOfTurnX: 2, startOfTurnY: 2, isIt: true, moveCount: 1 };
    const PLAYER_2: Player = { id: '2', name: 'Bob', emoji: '🧛', x: 5, y: 5, startOfTurnX: 5, startOfTurnY: 5, isIt: false, moveCount: 1 };
    
    const INITIAL_STATE: GameState = {
        phase: PHASE.ADD_PLAYER_NAME,
        players: [],
        turnIndex: 0,
        boardConfig: DEFAULT_BOARD,
        countdownTimer: 0,
        transitionProgress: 1.0,
        oldPhase: null,
        avatarSelectionIndex: 0,
        pendingPlayerName: ""
    };

    function createTestState(overrides: Partial<GameState>): GameState {
        return { ...INITIAL_STATE, ...overrides };
    }

    describe('PHASE.ADD_PLAYER_NAME', () => {
        it('should update pendingPlayerName on character KEY_PRESS', () => {
            const state = createTestState({ phase: PHASE.ADD_PLAYER_NAME, pendingPlayerName: "Ali" });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'c' });
            expect(next.pendingPlayerName).toBe("Alic");
        });

        it('should handle Backspace', () => {
            const state = createTestState({ phase: PHASE.ADD_PLAYER_NAME, pendingPlayerName: "Alice" });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Backspace' });
            expect(next.pendingPlayerName).toBe("Alic");
        });

        it('should transition to CHOOSE_PLAYER_AVATAR on Enter if name is not empty', () => {
            const state = createTestState({ phase: PHASE.ADD_PLAYER_NAME, pendingPlayerName: "Alice" });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.phase).toBe(PHASE.CHOOSE_PLAYER_AVATAR);
        });

        it('should NOT transition on Enter if name is empty', () => {
            const state = createTestState({ phase: PHASE.ADD_PLAYER_NAME, pendingPlayerName: "" });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.phase).toBe(PHASE.ADD_PLAYER_NAME);
        });
    });

    describe('PHASE.CHOOSE_PLAYER_AVATAR', () => {
        it('should update avatarSelectionIndex on a/d keys', () => {
            const state = createTestState({ phase: PHASE.CHOOSE_PLAYER_AVATAR, avatarSelectionIndex: 0 });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'd' });
            expect(next.avatarSelectionIndex).toBe(1);
            const prev = rootReducer(state, { type: 'KEY_PRESS', key: 'a' });
            expect(prev.avatarSelectionIndex).toBe(9); // Assuming 10 emojis
        });

        it('should add player and transition to CONFIRMATION on Enter', () => {
            const state = createTestState({ 
                phase: PHASE.CHOOSE_PLAYER_AVATAR, 
                pendingPlayerName: "Alice",
                avatarSelectionIndex: 0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.players.length).toBe(1);
            expect(next.players[0]!.name).toBe("Alice");
            expect(next.phase).toBe(PHASE.CONFIRMATION);
            expect(next.pendingPlayerName).toBe("");
        });

        it('should skip used emojis when navigating with a/d', () => {
            const state = createTestState({ 
                phase: PHASE.CHOOSE_PLAYER_AVATAR,
                players: [{ ...PLAYER_1, emoji: AVAILABLE_EMOJIS[1]! }], // 🧛 is used
                avatarSelectionIndex: 0 // 🧙
            });
            
            // From index 0, d should skip index 1 and go to index 2
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'd' });
            expect(next.avatarSelectionIndex).toBe(2);
            
            // From index 2, a should skip index 1 and go back to index 0
            const back = rootReducer(next, { type: 'KEY_PRESS', key: 'a' });
            expect(back.avatarSelectionIndex).toBe(0);
        });

        it('should NOT allow selecting a used emoji if Enter is pressed on one', () => {
            const state = createTestState({ 
                phase: PHASE.CHOOSE_PLAYER_AVATAR,
                players: [{ ...PLAYER_1, emoji: AVAILABLE_EMOJIS[0]! }], // 🧙 is used
                avatarSelectionIndex: 0 // Selection is on 🧙
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.players.length).toBe(1); // No new player added
            expect(next.phase).toBe(PHASE.CHOOSE_PLAYER_AVATAR);
        });
    });

    describe('PHASE.CONFIRMATION', () => {
        it('should transition back to ADD_PLAYER_NAME on "a"', () => {
            const state = createTestState({ phase: PHASE.CONFIRMATION, players: [PLAYER_1] });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'a' });
            expect(next.phase).toBe(PHASE.ADD_PLAYER_NAME);
        });

        it('should update board size on [ ] - = keys', () => {
            const state = createTestState({ phase: PHASE.CONFIRMATION, boardConfig: { width: 10, height: 10 } });
            expect(rootReducer(state, { type: 'KEY_PRESS', key: '=' }).boardConfig.width).toBe(11);
            expect(rootReducer(state, { type: 'KEY_PRESS', key: '-' }).boardConfig.width).toBe(9);
            expect(rootReducer(state, { type: 'KEY_PRESS', key: ']' }).boardConfig.height).toBe(11);
            expect(rootReducer(state, { type: 'KEY_PRESS', key: '[' }).boardConfig.height).toBe(9);
        });

        it('should transition to PRE_GAME_COUNTDOWN on Enter if enough players', () => {
            const state = createTestState({ phase: PHASE.CONFIRMATION, players: [PLAYER_1, PLAYER_2] });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.phase).toBe(PHASE.PRE_GAME_COUNTDOWN);
        });
    });

    describe('PHASE.ROUND', () => {
        it('should move current player and change turn and track lastMove on qweasdzxc', () => {
            const state = createTestState({ 
                phase: PHASE.ROUND, 
                players: [PLAYER_1, PLAYER_2], 
                turnIndex: 0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'd' }); // Right
            expect(next.players[0]!.x).toBe(3);
            expect(next.turnIndex).toBe(1);
            expect(next.lastMove).toEqual({ fromX: 2, fromY: 2, toX: 3, toY: 2 });
        });

        it('should NOT move if it hits a wall', () => {
            const playerAtEdge = { ...PLAYER_1, x: 0, y: 0 };
            const state = createTestState({ 
                phase: PHASE.ROUND, 
                players: [playerAtEdge, PLAYER_2], 
                turnIndex: 0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'a' }); // Left
            expect(next.players[0]!.x).toBe(0);
            expect(next.turnIndex).toBe(0); // Turn should not change if move rejected
        });

        it('should move 2 spaces on first turn with rtfhyvbn', () => {
            const newPlayer = { ...PLAYER_1, moveCount: 0, x: 2, y: 2 };
            const state = createTestState({ 
                phase: PHASE.ROUND, 
                players: [newPlayer, PLAYER_2], 
                turnIndex: 0,
                transitionProgress: 1.0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'h' }); // Right 2
            expect(next.players[0]!.x).toBe(4);
            expect(next.phase).toBe(PHASE.ROUND);
            expect(next.turnIndex).toBe(1);
        });

        it('should NOT move 2 spaces if NOT first turn', () => {
            const oldPlayer = { ...PLAYER_1, moveCount: 1, x: 2, y: 2 };
            const state = createTestState({ 
                phase: PHASE.ROUND, 
                players: [oldPlayer, PLAYER_2], 
                turnIndex: 0,
                transitionProgress: 1.0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'h' }); // Right 2
            expect(next.players[0]!.x).toBe(2); // No move
            expect(next.turnIndex).toBe(0);
        });

        it('should transition to TAGGING_WINDOW if "It" lands on another player', () => {
            const itPlayer = { ...PLAYER_1, x: 2, y: 2, isIt: true };
            const targetPlayer = { ...PLAYER_2, x: 3, y: 2, isIt: false };
            const state = createTestState({ 
                phase: PHASE.ROUND, 
                players: [itPlayer, targetPlayer], 
                turnIndex: 0 
            });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'd' }); // Right
            expect(next.phase).toBe(PHASE.TAGGING_WINDOW);
            expect(next.players[0]!.x).toBe(3);
        });
    });

    describe('PHASE.TAGGING_WINDOW', () => {
        const itPlayer = { ...PLAYER_1, x: 5, y: 5, startOfTurnX: 4, startOfTurnY: 5, isIt: true };
        const targetPlayer = { ...PLAYER_2, x: 5, y: 5, isIt: false };
        const state = createTestState({ 
            phase: PHASE.TAGGING_WINDOW, 
            players: [itPlayer, targetPlayer], 
            turnIndex: 0,
            countdownTimer: 2000
        });

        it('should transition to CELEBRATION on Enter if one target', () => {
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.phase).toBe(PHASE.CELEBRATION);
            expect(next.players[1]!.isIt).toBe(true);
        });

        it('should transition to PLAYER_SELECTION on Enter if multiple targets', () => {
            const player3 = { ...PLAYER_2, id: '3', x: 5, y: 5 };
            const multiState = { ...state, players: [itPlayer, targetPlayer, player3] };
            const next = rootReducer(multiState, { type: 'KEY_PRESS', key: 'Enter' });
            expect(next.phase).toBe(PHASE.PLAYER_SELECTION);
        });

        it('should retract move and skip turn on timeout', () => {
            const next = rootReducer(state, { type: 'TICK', dt: 2001 });
            expect(next.phase).toBe(PHASE.ROUND);
            expect(next.players[0]!.x).toBe(4); // Retracted to startOfTurnX
            expect(next.turnIndex).toBe(1); // Turn skipped
        });
    });

    describe('PHASE.PLAYER_SELECTION', () => {
        const itPlayer = { ...PLAYER_1, x: 5, y: 5, isIt: true };
        const target1 = { ...PLAYER_2, id: '2', x: 5, y: 5 };
        const target2 = { ...PLAYER_2, id: '3', x: 5, y: 5 };
        const state = createTestState({ 
            phase: PHASE.PLAYER_SELECTION, 
            players: [itPlayer, target1, target2], 
            turnIndex: 0 
        });

        it('should tag selected player on number key', () => {
            const next = rootReducer(state, { type: 'KEY_PRESS', key: '2' });
            expect(next.phase).toBe(PHASE.CELEBRATION);
            expect(next.players[2]!.isIt).toBe(true);
            expect(next.players[0]!.isIt).toBe(false);
        });
    });

    describe('PHASE.CELEBRATION', () => {
        it('should transition to RESET after timer', () => {
            const state = createTestState({ phase: PHASE.CELEBRATION, countdownTimer: 1000 });
            const next = rootReducer(state, { type: 'TICK', dt: 1001 });
            expect(next.phase).toBe(PHASE.RESET);
        });
    });

    describe('PHASE.RESET', () => {
        it('should start new round', () => {
            const state = createTestState({ phase: PHASE.RESET, players: [PLAYER_1, PLAYER_2] });
            const next = rootReducer(state, { type: 'TICK', dt: 16 });
            expect(next.phase).toBe(PHASE.PRE_GAME_COUNTDOWN);
            expect(next.players[0]!.moveCount).toBe(0);
            expect(next.players[1]!.moveCount).toBe(0);
        });
    });

    describe('TICK and transitionProgress', () => {
        it('should update transitionProgress', () => {
            const state = createTestState({ transitionProgress: 0.0 });
            const next = rootReducer(state, { type: 'TICK', dt: 500 });
            expect(next.transitionProgress).toBe(0.5);
        });

        it('should NOT handle inputs during transition', () => {
            const state = createTestState({ phase: PHASE.ROUND, transitionProgress: 0.5 });
            const next = rootReducer(state, { type: 'KEY_PRESS', key: 'd' });
            expect(next).toBe(state);
        });
    });
});
