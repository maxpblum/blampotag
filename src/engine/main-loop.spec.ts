import { MainLoop } from "./main-loop";
import { PHASE } from "../state/game-state";
import type { GameState } from "../state/game-state";
import type { GameRenderer } from "../rendering/game-renderer";
import type { KeyboardManager } from "../input-and-time-event-logic/keyboard";
import type { Ticker } from "../input-and-time-event-logic/ticker";

describe("MainLoop", () => {
    let renderer: jasmine.SpyObj<GameRenderer>;
    let keyboard: jasmine.SpyObj<KeyboardManager>;
    let ticker: jasmine.SpyObj<Ticker>;
    let loop: MainLoop;

    const initialState: GameState = {
        phase: PHASE.ADD_PLAYER_NAME,
        players: [],
        turnIndex: 0,
        boardConfig: { width: 8, height: 8 },
        countdownTimer: 0,
        transitionProgress: 1.0,
        oldPhase: null,
        avatarSelectionIndex: 0,
        pendingPlayerName: ""
    };

    beforeEach(() => {
        renderer = jasmine.createSpyObj("GameRenderer", ["render", "initAudio"]);
        keyboard = jasmine.createSpyObj("KeyboardManager", ["dispose"]);
        ticker = jasmine.createSpyObj("Ticker", ["start", "stop"]);
        loop = new MainLoop(initialState, renderer, keyboard, ticker);
    });

    it("should start the ticker", () => {
        loop.start();
        expect(ticker.start).toHaveBeenCalled();
    });

    it("should return the current state", () => {
        expect(loop.getState()).toEqual(initialState);
    });

    it("should update state on tick and call render", () => {
        const tickingState: GameState = { ...initialState, phase: PHASE.PRE_GAME_COUNTDOWN, countdownTimer: 3000 };
        const loopWithTick = new MainLoop(tickingState, renderer, keyboard, ticker);
        
        loopWithTick.loop(100); // Initialize lastTimestamp with 100
        loopWithTick.loop(200); // Actual tick with dt = 100
        expect(renderer.render).toHaveBeenCalled();
        expect(loopWithTick.getState().countdownTimer).toBe(2900);
    });

    it("should update state and initialize audio on key press", () => {
        loop.onKeyPress("a");
        expect(renderer.initAudio).toHaveBeenCalled();
        expect(loop.getState().pendingPlayerName).toBe("a");
    });

    it("should handle movement keys", () => {
        // Set up state for ROUND phase
        const roundState: GameState = { 
            ...initialState, 
            phase: PHASE.ROUND,
            players: [{ id: "1", name: "P1", emoji: "🧙", x: 1, y: 1, startOfTurnX: 1, startOfTurnY: 1, isIt: false }]
        };
        const loopWithRound = new MainLoop(roundState, renderer, keyboard, ticker);
        
        loopWithRound.onKeyPress("ArrowUp");
        expect(loopWithRound.getState().players[0]!.y).toBe(0);
    });
});
