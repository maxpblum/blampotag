/// <reference types="jasmine" />
import { createBuffer, writeStringToBuffer, drawBox } from "./buffer-renderer";
import type { CharacterBuffer } from "./buffer-renderer";

describe('Grid Rendering', () => {
    it('should maintain consistent row lengths even with emojis', () => {
        const width = 20;
        const height = 5;
        let buffer = createBuffer(width, height);
        
        // Write a string with an emoji
        buffer = writeStringToBuffer(buffer, "Player 🧙 is here", 0, 0);
        
        // Verify all rows still have the same number of 'slots' (even if some are empty tails)
        buffer.forEach((row, i) => {
            expect(row.length).toBe(width, `Row ${i} length mismatch`);
        });
    });

    it('should correctly position an emoji and nullify the following cell', () => {
        const width = 10;
        const height = 1;
        let buffer = createBuffer(width, height);
        
        const emoji = "🧙";
        buffer = writeStringToBuffer(buffer, emoji, 2, 0);
        
        // The cell at index 2 should have the emoji
        expect(buffer[0]![2]!.char).toBe(emoji);
        expect(buffer[0]![2]!.isWide).toBeTrue();
        
        // The cell at index 3 should be an empty "tail" to prevent shifting
        expect(buffer[0]![3]!.char).toBe("");
        expect(buffer[0]![3]!.isWide).toBeFalse();
        
        // The cell at index 4 should still be a space
        expect(buffer[0]![4]!.char).toBe(" ");
    });

    it('should handle background colors correctly', () => {
        const width = 5;
        const height = 1;
        let buffer = createBuffer(width, height);
        
        buffer = writeStringToBuffer(buffer, "ABC", 0, 0, "red", "blue");
        
        expect(buffer[0]![0]!.backgroundColor).toBe("blue");
        expect(buffer[0]![0]!.color).toBe("red");
        expect(buffer[0]![3]!.backgroundColor).toBe("transparent"); // Default
    });

    it('should handle borders correctly', () => {
        const width = 10;
        const height = 5;
        let buffer = createBuffer(width, height);
        buffer = drawBox(buffer, 0, 0, width, height);
        
        // Check corners
        expect(buffer[0]![0]!.char).toBe("╔");
        expect(buffer[0]![9]!.char).toBe("╗");
        expect(buffer[4]![0]!.char).toBe("╚");
        expect(buffer[4]![9]!.char).toBe("╝");
        
        // Check row lengths
        buffer.forEach(row => expect(row.length).toBe(width));
    });
});
