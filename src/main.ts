import { MainLoop } from "./engine/main-loop";
import { PHASE } from "./state/game-state";
import { GameRenderer } from "./rendering/game-renderer";
import { WebAudioPlayer } from "./audio/game-audio";
import { AudioEngine } from "./audio/audio-engine";
import { KeyboardManager } from "./input-and-time-event-logic/keyboard";
import { Ticker } from "./input-and-time-event-logic/ticker";

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

    const audioEngine = new AudioEngine();
    const gameAudio = new WebAudioPlayer(audioEngine);
    const renderer = new GameRenderer(container, gameAudio);
    
    let engine: MainLoop;
    const ticker = new Ticker((ts) => engine.loop(ts));
    const keyboard = new KeyboardManager((key) => engine.onKeyPress(key));
    
    engine = new MainLoop(initialState, renderer, keyboard, ticker);
    
    // Expose the engine to the global window object to allow E2E tests
    (window as any).gameEngine = engine;
    engine.start();
} else {
    console.error("Game container not found!");
}

console.log("Blampotag Init Refactored");
