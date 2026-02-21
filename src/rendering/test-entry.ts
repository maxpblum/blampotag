import { GameRenderer } from "./game-renderer";
import { PHASE } from "../state/game-state";
import type { GameState } from "../state/game-state";

// Mock AudioEffectPlayer for testing
const mockAudio = {
    init: () => {},
    playMove: () => {},
    playTag: () => {},
    playSelect: () => {},
    playFanfare: () => {},
    playSetupMusic: () => {},
    playGameMusic: () => {},
    playTensionMusic: () => {},
    stopMusic: () => {}
} as any;

(window as any).renderState = (state: GameState, previousState: GameState | null = null, totalTime: number = 0) => {
    const container = document.getElementById("game-output");
    if (container) {
        const renderer = new GameRenderer(container, mockAudio);
        renderer.render(state, previousState, totalTime);
    }
};

(window as any).PHASE = PHASE;
