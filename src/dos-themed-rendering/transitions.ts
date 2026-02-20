import { CharacterBuffer, Cell } from "./buffer-renderer";

export function getBlockyWipeBuffer(
    oldBuffer: CharacterBuffer,
    newBuffer: CharacterBuffer,
    progress: number
): CharacterBuffer {
    // progress: 0.0 to 1.0
    const height = oldBuffer.length;
    const width = oldBuffer[0].length;
    const totalBlocks = width * height;
    const blocksToShow = Math.floor(totalBlocks * progress);

    const nextBuffer = oldBuffer.map((row, y) =>
        row.map((cell, x) => {
            // Pseudo-random but deterministic based on x,y
            // We'll use a simple hash
            const h = (x * 123.456 + y * 789.012) % 1;
            if (h < progress) {
                return newBuffer[y][x];
            }
            return cell;
        })
    );

    return nextBuffer;
}
