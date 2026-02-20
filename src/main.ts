import { MainLoop } from "./engine/main-loop";
import { PHASE } from "./state/game-state";

const container = document.getElementById("game-output");
if (container) {
    const initialState = {
        phase: PHASE.NAME_ENTRY,
        players: [
            { id: "1", name: "Player 1", emoji: "🧙", x: 2, y: 2, isIt: true }
        ],
        turnIndex: 0,
        boardConfig: { width: 10, height: 10 }
    };

    const engine = new MainLoop(initialState, container);
    engine.start();
} else {
    console.error("Game container not found!");
}

console.log("Blampotag Init");
