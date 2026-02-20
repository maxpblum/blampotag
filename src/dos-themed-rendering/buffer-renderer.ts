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

export function renderToContainer(buffer: CharacterBuffer, container: HTMLElement): void {
    const text = buffer
        .map((row) => row.map((cell) => cell.char).join(""))
        .join("
");
    container.textContent = text;
}
