export class KeyboardManager {
    private readonly pressedKeys = new Set<string>();

    constructor(private readonly onKeyPress: (key: string) => void) {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
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
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
    }
}
