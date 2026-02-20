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
        const targetY = y + dy;
        const row = nextBuffer[targetY];
        if (!row) return;
        const chars = Array.from(line);
        for (let dx = 0; dx < chars.length; dx++) {
            const targetX = x + dx;
            if (targetX < 0 || targetX >= row.length) continue;
            const char = chars[dx] || " ";
            row[targetX] = { char, color };
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
    
    for (let dx = 1; dx < width - 1; dx++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y, color);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y + height - 1, color);
    }
    
    for (let dy = 1; dy < height - 1; dy++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x, y + dy, color);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x + width - 1, y + dy, color);
    }
    
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_LEFT, x, y, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_RIGHT, x + width - 1, y, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_LEFT, x, y + height - 1, color);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_RIGHT, x + width - 1, y + height - 1, color);
    
    return nextBuffer;
}

export function renderToContainer(buffer: CharacterBuffer, container: HTMLElement): void {
    let html = "";
    for (let y = 0; y < buffer.length; y++) {
        const row = buffer[y];
        if (!row) continue;
        let currentRowHtml = "";
        let currentColor = "";
        
        for (let x = 0; x < row.length; x++) {
            const cell = row[x];
            if (!cell) continue;
            if (cell.color !== currentColor) {
                if (currentColor !== "") currentRowHtml += "</span>";
                currentRowHtml += `<span style="color: ${cell.color}">`;
                currentColor = cell.color;
            }
            const replacements: Record<string, string> = {
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            };
            const char = cell.char === " " ? "&nbsp;" : cell.char.replace(/[&<>"']/g, m => replacements[m] || m);
            currentRowHtml += char;
        }
        if (currentColor !== "") currentRowHtml += "</span>";
        html += currentRowHtml + "\n";
    }
    container.innerHTML = html;
}
