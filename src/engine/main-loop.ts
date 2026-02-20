import type { GameState } from "../state/game-state";
import { rootReducer } from "../state/reducer";
import type { GameEvent } from "../state/reducer";
import { KeyboardManager } from "../input-and-time-event-logic/keyboard";
import { GameRenderer } from "../rendering/game-renderer";
import { Ticker } from "../input-and-time-event-logic/ticker";

export class MainLoop {
    private state: GameState;
    private previousState: GameState | null = null;
    private lastTimestamp: number = 0;
    private totalTime: number = 0;

    constructor(
        initialState: GameState,
        private readonly renderer: GameRenderer,
        private readonly keyboard: KeyboardManager,
        private readonly ticker: Ticker
    ) {
        this.state = initialState;
    }

    public start(): void {
        this.ticker.start();
    }

    public getState(): GameState {
        return this.state;
    }

    public readonly onKeyPress = (key: string): void => {
        this.renderer.initAudio();
        this.update({ type: "KEY_PRESS", key });
        
        switch (key) {
            case "ArrowUp": this.update({ type: "MOVE", dx: 0, dy: -1 }); break;
            case "ArrowDown": this.update({ type: "MOVE", dx: 0, dy: 1 }); break;
            case "ArrowLeft": this.update({ type: "MOVE", dx: -1, dy: 0 }); break;
            case "ArrowRight": this.update({ type: "MOVE", dx: 1, dy: 0 }); break;
            case "q": this.update({ type: "MOVE", dx: -1, dy: -1 }); break;
            case "e": this.update({ type: "MOVE", dx: 1, dy: -1 }); break;
            case "z": this.update({ type: "MOVE", dx: -1, dy: 1 }); break;
            case "c": this.update({ type: "MOVE", dx: 1, dy: 1 }); break;
        }
    };

    public readonly loop = (timestamp: number): void => {
        const dt = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;
        this.totalTime += dt;

        this.update({ type: "TICK", dt });
        this.render();
    };

    private update(event: GameEvent): void {
        this.previousState = this.state;
        this.state = rootReducer(this.state, event);
    }

    private render(): void {
        this.renderer.render(this.state, this.previousState, this.totalTime);
    }
}
