import { BOX_CHARS } from "./ascii-assets";

export type Cell = {
    readonly char: string;
    readonly color: string;
    readonly backgroundColor: string;
    readonly fontSize?: string;
    readonly isWide?: boolean; // If true, this character takes up 2 monospaced slots
    readonly overlay?: {
        readonly char: string;
        readonly color: string;
        readonly backgroundColor: string;
        readonly fontSize?: string;
    };
};

export type CharacterBuffer = readonly (readonly Cell[])[];

export function createBuffer(width: number, height: number): CharacterBuffer {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            char: " ",
            color: "var(--vga-light-gray)",
            backgroundColor: "var(--vga-black)",
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
            
            row[currentX] = { char, color, backgroundColor, isWide, ...(fontSize ? { fontSize } : {}) };
            
            // If it's wide, we must effectively "nullify" the next cell to prevent overlap/shift
            if (isWide && currentX + 1 < row.length) {
                row[currentX + 1] = { char: "", color, backgroundColor, isWide: false, ...(fontSize ? { fontSize } : {}) };
                currentX += 2;
            } else {
                // If we're overwriting a wide char's head with a non-wide char,
                // the tail must become a space to preserve layout.
                const nextCell = row[currentX + 1];
                if (nextCell && nextCell.char === "") {
                    row[currentX + 1] = { ...nextCell, char: " " };
                }
                currentX += 1;
            }
        }
    });
    return nextBuffer;
}

export function writeOverlayToBuffer(
    buffer: CharacterBuffer,
    text: string,
    x: number,
    y: number,
    color: string,
    backgroundColor: string,
    fontSize?: string
): CharacterBuffer {
    const nextBuffer = buffer.map((row) => [...row]);
    const lines = text.split("\n");
    lines.forEach((line, dy) => {
        const targetY = y + dy;
        const row = nextBuffer[targetY];
        if (!row) return;
        const chars = Array.from(line);
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i] || " ";
            const currentX = x + i;
            if (currentX < 0 || currentX >= row.length) continue;
            
            const baseCell = row[currentX];
            if (!baseCell) continue;

            row[currentX] = {
                ...baseCell,
                overlay: { char, color, backgroundColor, fontSize }
            };
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
            const overlay = cell.overlay;
            
            // Collect contiguous characters with the same style (and NO overlay)
            let blockText = "";
            let blockCharCount = 0;
            let currentX = x;
            
            while (currentX < row.length) {
                const nextCell = row[currentX];
                if (!nextCell || nextCell.char === "") {
                    // Wide character tail
                    if (nextCell && nextCell.char === "") {
                        currentX++;
                    } else {
                        break;
                    }
                    continue;
                }
                
                // Overlays break the block
                if (nextCell.overlay || overlay) {
                    if (currentX > x) break; // If we already have some block text, stop
                }

                if (nextCell.color !== color || nextCell.backgroundColor !== bgColor || nextCell.fontSize !== fontSize || nextCell.overlay !== overlay) {
                    break;
                }
                
                const replacements: Record<string, string> = {
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
                };
                const char = nextCell.char.replace(/[&<>"']/g, m => replacements[m] || m);
                blockText += char;
                blockCharCount += nextCell.isWide ? 2 : 1;
                currentX++;

                // If this cell has an overlay, we can't add more cells to this block because the overlay is unique to this cell
                if (overlay) break;
            }
            
            const commonStyle = `color: ${color}; background-color: ${bgColor}; line-height: 1;`;
            
            let cellHtml = "";
            if (fontSize || overlay) {
                // Large character or overlaid character: use a wrapper to preserve grid spacing.
                const wrapperStyle = [
                    commonStyle,
                    "display: inline-flex",
                    `width: ${blockCharCount}ch`,
                    "height: 1em",
                    "align-items: center",
                    "justify-content: center",
                    "vertical-align: top",
                    "position: relative",
                    "z-index: 10",
                    "overflow: visible"
                ].join("; ") + ";";
                
                const innerStyle = `font-size: ${fontSize || "inherit"}; line-height: 1; display: inline-block;`;
                cellHtml = `<span style="${wrapperStyle}"><span style="${innerStyle}">${blockText}</span>`;
                
                if (overlay) {
                    const overlayStyle = [
                        `color: ${overlay.color}`,
                        `background-color: ${overlay.backgroundColor}`,
                        `font-size: ${overlay.fontSize || "inherit"}`,
                        "position: absolute",
                        "top: 50%",
                        "left: 50%",
                        "transform: translate(-50%, -50%)",
                        "z-index: 20",
                        "line-height: 1",
                        "display: inline-block",
                        "padding: 2px", // Add some padding for the overlay background
                        "border-radius: 2px"
                    ].join("; ") + ";";
                    cellHtml += `<span style="${overlayStyle}">${overlay.char}</span>`;
                }
                
                cellHtml += `</span>`;
            } else {
                // Normal text: use inline-block with fixed width to ensure grid alignment.
                const style = [
                    commonStyle,
                    "display: inline-block",
                    `width: ${blockCharCount}ch`,
                    "vertical-align: top",
                    "white-space: pre"
                ].join("; ") + ";";
                cellHtml = `<span style="${style}">${blockText}</span>`;
            }
            currentRowHtml += cellHtml;
            x = currentX;
        }
        // Use flexbox for the row to ensure spans touch perfectly with no gaps.
        // overflow: visible allows large characters to bleed into adjacent rows/cells.
        html += `<div style="display: flex; line-height: 1; height: 1em; white-space: pre; overflow: visible;">${currentRowHtml}</div>`;
    }
    if (container.innerHTML !== html) {
        container.innerHTML = html;
    }
}
        
