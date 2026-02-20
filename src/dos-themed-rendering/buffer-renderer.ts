import { BOX_CHARS } from "./ascii-assets";

export type Cell = {
    readonly char: string;
    readonly color: string;
};

export type CharacterBuffer = readonly (readonly Cell[])[];

export function createBuffer(width: number, height: number): CharacterBuffer {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            char: " ",
            color: "var(--vga-light-gray)",
        }))
    );
}

export function writeStringToBuffer(
    buffer: CharacterBuffer,
    text: string,
    x: number,
    y: number,
    color: string = "var(--vga-light-gray)"
): CharacterBuffer {
    const nextBuffer = buffer.map((row) => [...row]);
    const lines = text.split("\n");
    lines.forEach((line, dy) => {
        if (y + dy < 0 || y + dy >= nextBuffer.length) return;
        const row = nextBuffer[y + dy];
        for (let dx = 0; dx < line.length; dx++) {
            if (x + dx < 0 || x + dx >= row.length) continue;
            row[x + dx] = { char: line[dx], color };
        }
    });
    return nextBuffer;
}

export function drawBox(
    buffer: CharacterBuffer,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = "var(--vga-light-gray)"
): CharacterBuffer {
    let nextBuffer = buffer;
    
    // Horizontal lines
    for (let dx = 1; dx < width - 1; dx++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y, color);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y + height - 1, color);
    }
    
    // Vertical lines
    for (let dy = 1; dy < height - 1; dy++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x, y + dy, color);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x + width - 1, y + dy, color);
    }
    
    // Corners
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_LEFT, x, y, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_RIGHT, x + width - 1, y, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_LEFT, x, y + height - 1, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_RIGHT, x + width - 1, y + height - 1, color);
    
    return nextBuffer;
}

export function renderToContainer(buffer: CharacterBuffer, container: HTMLElement): void {
    const text = buffer
        .map((row) => row.map((cell) => cell.char).join(""))
        .join("
");
    container.textContent = text;
}
