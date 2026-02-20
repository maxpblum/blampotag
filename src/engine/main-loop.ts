import { GameState, PHASE } from "../state/game-state";
import { rootReducer, GameEvent } from "../state/reducer";
import { renderToContainer, createBuffer, drawBox, writeStringToBuffer } from "../dos-themed-rendering/buffer-renderer";
import { KeyboardManager } from "../input-and-time-event-logic/keyboard";

export class MainLoop {
    private state: GameState;
    private lastTimestamp: number = 0;
    private readonly keyboard: KeyboardManager;

    constructor(
        initialState: GameState,
        private readonly container: HTMLElement
    ) {
        this.state = initialState;
        this.keyboard = new KeyboardManager(this.onKeyPress);
    }

    public start(): void {
        requestAnimationFrame(this.loop);
    }

    private readonly onKeyPress = (key: string): void => {
        switch (key) {
            case "ArrowUp": this.update({ type: "MOVE", dx: 0, dy: -1 }); break;
            case "ArrowDown": this.update({ type: "MOVE", dx: 0, dy: 1 }); break;
            case "ArrowLeft": this.update({ type: "MOVE", dx: -1, dy: 0 }); break;
            case "ArrowRight": this.update({ type: "MOVE", dx: 1, dy: 0 }); break;
        }
    };

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
        const { boardConfig, players } = this.state;
        let buffer = createBuffer(boardConfig.width + 2, boardConfig.height + 2);
        
        // Draw board border
        buffer = drawBox(buffer, 0, 0, boardConfig.width + 2, boardConfig.height + 2);
        
        // Render players
        players.forEach(player => {
            buffer = writeStringToBuffer(buffer, player.emoji, player.x + 1, player.y + 1);
        });
        
        renderToContainer(buffer, this.container);
    }
}
