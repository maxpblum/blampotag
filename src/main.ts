import { MainLoop } from "./engine/main-loop";
import { PHASE } from "./state/game-state";

const container = document.getElementById("game-output");
if (container) {
    const initialState = {
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

    const engine = new MainLoop(initialState, container);
    // Expose the engine to the global window object to allow E2E tests (like Playwright)
    // to inspect and verify the internal game state during runtime.
    (window as any).gameEngine = engine;
    engine.start();
} else {
    console.error("Game container not found!");
}

console.log("Blampotag Init");
