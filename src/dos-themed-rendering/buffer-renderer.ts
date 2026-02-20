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

export function renderToContainer(buffer: CharacterBuffer, container: HTMLElement): void {
    const text = buffer
        .map((row) => row.map((cell) => cell.char).join(""))
        .join("
");
    container.textContent = text;
}
