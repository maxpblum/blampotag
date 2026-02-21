import type { CharacterBuffer, Cell } from "./buffer-renderer";
import { writeStringToBuffer } from "./buffer-renderer";

export function overlayHearts(buffer: CharacterBuffer, time: number): CharacterBuffer {
    let nextBuffer = buffer;
    const count = 5;
    for (let i = 0; i < count; i++) {
        const x = Math.floor(((i * 123.456 + time / 1000 * 10) % 80));
        const y = Math.floor(((i * 789.012 + time / 1000 * 5) % 25));
        const cell = buffer[y]?.[x];
        const bgColor = cell ? cell.backgroundColor : "var(--vga-black)";
        nextBuffer = writeStringToBuffer(nextBuffer, "❤", x, y, "var(--vga-bright-red)", bgColor);
    }
    return nextBuffer;
}

export function overlayRainbow(buffer: CharacterBuffer, time: number): CharacterBuffer {
    const rainbowColors = [
        "var(--vga-bright-red)",
        "var(--vga-yellow)",
        "var(--vga-bright-green)",
        "var(--vga-bright-cyan)",
        "var(--vga-bright-blue)",
        "var(--vga-bright-magenta)",
    ];
    
    return buffer.map((row, y) =>
        row.map((cell, x) => {
            if (cell.char === " ") {
                const colorIdx = Math.floor((x + y + time / 100) % rainbowColors.length);
                return { ...cell, char: "░", color: rainbowColors[colorIdx] || "white" };
            }
            return cell;
        })
    );
}
