import { CharacterBuffer, Cell, writeStringToBuffer } from "./buffer-renderer";

export function overlayHearts(buffer: CharacterBuffer, time: number): CharacterBuffer {
    let nextBuffer = buffer;
    const count = 5;
    for (let i = 0; i < count; i++) {
        const x = Math.floor(((i * 123.456 + time / 1000 * 10) % 80));
        const y = Math.floor(((i * 789.012 + time / 1000 * 5) % 25));
        nextBuffer = writeStringToBuffer(nextBuffer, "❤", x, y, "var(--vga-bright-red)");
    }
    return nextBuffer;
}
