import type { CharacterBuffer, Cell } from "./buffer-renderer";

export function getBlockyWipeBuffer(
    oldBuffer: CharacterBuffer,
    newBuffer: CharacterBuffer,
    progress: number
): CharacterBuffer {
    const height = oldBuffer.length;
    if (height === 0) return oldBuffer;
    const width = oldBuffer[0]?.length || 0;

    const nextBuffer = oldBuffer.map((row, y) =>
        row.map((cell, x) => {
            const h = (x * 123.456 + y * 789.012) % 1;
            if (h < progress) {
                return newBuffer[y]?.[x] || cell;
            }
            return cell;
        })
    );

    return nextBuffer;
}
