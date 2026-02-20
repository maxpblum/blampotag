export class KeyboardManager {
    private readonly pressedKeys = new Set<string>();

    constructor(
        private readonly onKeyPress: (key: string) => void,
        private readonly target: EventTarget = window
    ) {
        this.target.addEventListener("keydown", this.handleKeyDown as EventListener);
        this.target.addEventListener("keyup", this.handleKeyUp as EventListener);
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (!this.pressedKeys.has(event.key)) {
            this.pressedKeys.add(event.key);
            console.log(`Key pressed: ${event.key}`);
            this.onKeyPress(event.key);
        }
    };

    private readonly handleKeyUp = (event: KeyboardEvent): void => {
        this.pressedKeys.delete(event.key);
    };

    public dispose(): void {
        this.target.removeEventListener("keydown", this.handleKeyDown as EventListener);
        this.target.removeEventListener("keyup", this.handleKeyUp as EventListener);
    }
}
