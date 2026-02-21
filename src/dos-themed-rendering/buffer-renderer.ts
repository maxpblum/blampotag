import { BOX_CHARS } from "./ascii-assets";

export type Cell = {
    readonly char: string;
    readonly color: string;
    readonly backgroundColor: string;
    readonly fontSize?: string;
    readonly isWide?: boolean; // If true, this character takes up 2 monospaced slots
};

export type CharacterBuffer = readonly (readonly Cell[])[];

export function createBuffer(width: number, height: number): CharacterBuffer {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            char: " ",
            color: "var(--vga-light-gray)",
            backgroundColor: "var(--vga-black)",
            fontSize: undefined,
        }))
    );
}

export function writeStringToBuffer(
    buffer: CharacterBuffer,
    text: string,
    x: number,
    y: number,
    color: string = "var(--vga-light-gray)",
    backgroundColor: string = "var(--vga-black)",
    fontSize?: string
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
            
            row[currentX] = { char, color, backgroundColor, fontSize, isWide };
            
            // If it's wide, we must effectively "nullify" the next cell to prevent overlap/shift
            if (isWide && currentX + 1 < row.length) {
                row[currentX + 1] = { char: "", color, backgroundColor, fontSize, isWide: false }; // Empty string won't render
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
    backgroundColor: string = "var(--vga-black)"
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
        let x = 0;
        
        while (x < row.length) {
            const cell = row[x];
            if (!cell || cell.char === "") {
                x++;
                continue;
            }
            
            const color = cell.color;
            const bgColor = cell.backgroundColor;
            const fontSize = cell.fontSize;
            
            // Collect contiguous characters with the same style
            let blockText = "";
            let blockCharCount = 0;
            let currentX = x;
            
            while (currentX < row.length) {
                const nextCell = row[currentX];
                if (!nextCell || nextCell.char === "") {
                    // Wide character tail - shouldn't happen here due to skip, but handle for safety
                    if (nextCell && nextCell.char === "") {
                        currentX++;
                    } else {
                        break;
                    }
                    continue;
                }
                
                const nextBg = nextCell.backgroundColor;
                if (nextCell.color !== color || nextBg !== bgColor || nextCell.fontSize !== fontSize) {
                    break;
                }
                
                const replacements: Record<string, string> = {
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
                };
                const char = nextCell.char === " " ? "&nbsp;" : nextCell.char.replace(/[&<>"']/g, m => replacements[m] || m);
                blockText += char;
                blockCharCount += nextCell.isWide ? 2 : 1;
                currentX++;
            }
            
            const fontSizeStyle = fontSize ? `font-size: ${fontSize};` : "";
            currentRowHtml += `<span style="color: ${color}; background-color: ${bgColor}; ${fontSizeStyle} display: inline-block; width: ${blockCharCount}ch;">${blockText}</span>`;
            x = currentX;
        }
        html += currentRowHtml + "\n";
    }
    if (container.innerHTML !== html) {
        container.innerHTML = html;
    }
}
        
