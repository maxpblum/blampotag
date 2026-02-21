import { BOX_CHARS } from "./ascii-assets";

export type Cell = {
    readonly char: string;
    readonly color: string;
    readonly backgroundColor?: string;
    readonly isWide?: boolean; // If true, this character takes up 2 monospaced slots
};

export type CharacterBuffer = readonly (readonly Cell[])[];

export function createBuffer(width: number, height: number): CharacterBuffer {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            char: " ",
            color: "var(--vga-light-gray)",
            backgroundColor: "transparent",
        }))
    );
}

export function writeStringToBuffer(
    buffer: CharacterBuffer,
    text: string,
    x: number,
    y: number,
    color: string = "var(--vga-light-gray)",
    backgroundColor: string = "transparent"
): CharacterBuffer {
    const nextBuffer = buffer.map((row) => [...row]);
    const lines = text.split("\n");
    lines.forEach((line, dy) => {
        const targetY = y + dy;
        const row = nextBuffer[targetY];
        if (!row) return;
        const chars = Array.from(line);
        let currentX = x;
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i] || " ";
            if (currentX < 0 || currentX >= row.length) {
                currentX++;
                continue;
            }
            
            // Basic heuristic for double-width characters (emojis)
            const isWide = char.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/u) !== null;
            
            row[currentX] = { char, color, backgroundColor, isWide };
            
            // If it's wide, we must effectively "nullify" the next cell to prevent overlap/shift
            if (isWide && currentX + 1 < row.length) {
                row[currentX + 1] = { char: "", color, backgroundColor, isWide: false }; // Empty string won't render
                currentX += 2;
            } else {
                currentX += 1;
            }
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
    color: string = "var(--vga-light-gray)",
    backgroundColor: string = "transparent"
): CharacterBuffer {
    let nextBuffer = buffer;
    
    for (let dx = 1; dx < width - 1; dx++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y, color, backgroundColor);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.HORIZONTAL, x + dx, y + height - 1, color, backgroundColor);
    }
    
    for (let dy = 1; dy < height - 1; dy++) {
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x, y + dy, color, backgroundColor);
        nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.VERTICAL, x + width - 1, y + dy, color, backgroundColor);
    }
    
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_LEFT, x, y, color, backgroundColor);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.TOP_RIGHT, x + width - 1, y, color, backgroundColor);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_LEFT, x, y + height - 1, color, backgroundColor);
    nextBuffer = writeStringToBuffer(nextBuffer, BOX_CHARS.BOTTOM_RIGHT, x + width - 1, y + height - 1, color, backgroundColor);
    
    return nextBuffer;
}

export function renderToContainer(buffer: CharacterBuffer, container: HTMLElement): void {
    let html = "";
    for (let y = 0; y < buffer.length; y++) {
        const row = buffer[y];
        if (!row) continue;
        let currentRowHtml = "";
        let currentColor = "";
        let currentBgColor = "";
        
        for (let x = 0; x < row.length; x++) {
            const cell = row[x];
            if (!cell || cell.char === "") continue; // Skip wide char tails
            
            const bgColor = cell.backgroundColor || "transparent";
            if (cell.color !== currentColor || bgColor !== currentBgColor) {
                if (currentColor !== "" || currentBgColor !== "") currentRowHtml += "</span>";
                currentRowHtml += `<span style="color: ${cell.color}; background-color: ${bgColor}">`;
                currentColor = cell.color;
                currentBgColor = bgColor;
            }
            const replacements: Record<string, string> = {
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            };
            const char = cell.char === " " ? "&nbsp;" : cell.char.replace(/[&<>"']/g, m => replacements[m] || m);
            currentRowHtml += char;
        }
        if (currentColor !== "" || currentBgColor !== "") currentRowHtml += "</span>";
        html += currentRowHtml + "\n";
    }
    if (container.innerHTML !== html) {
        container.innerHTML = html;
    }
}
        
