import { GameState, PHASE } from "../state/game-state";
import { rootReducer, GameEvent } from "../state/reducer";
import { renderToContainer, createBuffer } from "../dos-themed-rendering/buffer-renderer";

export class MainLoop {
    private state: GameState;
    private lastTimestamp: number = 0;

    constructor(
        initialState: GameState,
        private readonly container: HTMLElement
    ) {
        this.state = initialState;
    }

    public start(): void {
        requestAnimationFrame(this.loop);
    }

    private readonly loop = (timestamp: number): void => {
        const dt = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;

        this.update({ type: "TICK", dt });
        this.render();

        requestAnimationFrame(this.loop);
    };

    private update(event: GameEvent): void {
        this.state = rootReducer(this.state, event);
    }

    private render(): void {
        // Simple placeholder render
        const buffer = createBuffer(80, 25);
        renderToContainer(buffer, this.container);
    }
}
