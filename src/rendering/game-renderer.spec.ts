import { GameRenderer } from "./game-renderer";
import { PHASE } from "../state/game-state";
import type { GameState } from "../state/game-state";
import type { AudioEffectPlayer } from "../audio/game-audio";

describe("GameRenderer", () => {
    let container: HTMLElement;
    let audio: jasmine.SpyObj<AudioEffectPlayer>;
    let renderer: GameRenderer;

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
        container = { innerHTML: "" } as any;
        audio = jasmine.createSpyObj("AudioEffectPlayer", ["playMove", "playFanfare", "playTag", "playSelect", "init", "playSetupMusic", "playGameMusic", "playTensionMusic", "stopMusic"]);
        renderer = new GameRenderer(container, audio);
    });

    it("should initialize audio", () => {
        renderer.initAudio();
        expect(audio.init).toHaveBeenCalled();
    });

    it("should trigger fanfare when transitioning to celebration phase", () => {
        const nextState: GameState = { ...initialState, phase: PHASE.CELEBRATION };
        renderer.render(nextState, initialState, 0);
        expect(audio.playFanfare).toHaveBeenCalled();
    });

    it("should trigger tag sound when transitioning to tagging window phase", () => {
        const nextState: GameState = { ...initialState, phase: PHASE.TAGGING_WINDOW };
        renderer.render(nextState, initialState, 0);
        expect(audio.playTag).toHaveBeenCalled();
    });

    it("should trigger move sound when a player moves", () => {
        const previousState: GameState = { 
            ...initialState, 
            players: [{ id: "1", name: "P1", emoji: "🧙", x: 0, y: 0, startOfTurnX: 0, startOfTurnY: 0, isIt: false, moveCount: 0 }] 
        };
        const nextState: GameState = { 
            ...previousState, 
            players: [{ id: "1", name: "P1", emoji: "🧙", x: 1, y: 0, startOfTurnX: 0, startOfTurnY: 0, isIt: false, moveCount: 0 }] 
        };
        renderer.render(nextState, previousState, 0);
        expect(audio.playMove).toHaveBeenCalled();
    });

    it("should render content to container", () => {
        renderer.render(initialState, null, 0);
        expect(container.innerHTML).not.toBe("");
    });

    it("should handle transitions between phases", () => {
        const stateWithTransition: GameState = { 
            ...initialState, 
            phase: PHASE.ROUND, 
            oldPhase: PHASE.PRE_GAME_COUNTDOWN, 
            transitionProgress: 0.5 
        };
        renderer.render(stateWithTransition, initialState, 0);
        expect(container.innerHTML).not.toBe("");
    });
});
