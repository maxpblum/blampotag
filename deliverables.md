# Blampotag: Project Deliverables & Roadmap

This document tracks the progress of Blampotag. It follows a "Functional Core, Imperative Shell" architecture, ensuring that every commit results in a working, integrated prototype.

## Deliverables Status

### 1. Development Environment & Infrastructure
*Establish the project foundation using `npm init`, Vite, TypeScript (Strict mode), and Jasmine.*
- **Progress:**
  - [x] Initialize NPM and project structure.
  - [ ] Configure Vite for static serving.
  - [x] Set up the "CRT/DOS" CSS shell.
  - [ ] Integrate Jasmine for unit testing.
- **Status:** In Progress

### 2. Core Game State & Logic (Functional Core)
*Implement the `Readonly GameState` and the pure `reducer` function.*
- **Progress:**
  - [ ] Define `GameState`, `Player`, and `Phase` types.
  - [ ] Implement pure `rootReducer` for state transitions.
  - [ ] Add movement, boundary, and collision logic.
  - [ ] Verify all logic with Jasmine tests.
- **Status:** Not Started

### 3. Input Handling & Engine Orchestration (Imperative Shell)
*Build the `KeyboardManager` and the global `requestAnimationFrame` loop.*
- **Progress:**
  - [ ] Create `KeyboardManager` with "press-and-held" logic.
  - [ ] Implement `runEngine` loop to maintain mutable state.
  - [ ] Connect input events to the state reducer.
- **Status:** Not Started

### 4. DOS-Themed Rendering Engine
*Develop the `buffer-renderer` and ASCII asset library.*
- **Progress:**
  - [ ] Implement `CharacterBuffer` renderer for DOM `<pre>`.
  - [ ] Create FIGlet-style title and box-drawing assets.
  - [ ] Build DOS-style transition effects (wipes/fades).
- **Status:** Not Started

### 5. Initialization & Setup Flow
*Implement the game's start-up phases: `NAME_ENTRY`, `CONFIRMATION`, and `PRE_GAME_COUNTDOWN`.*
- **Progress:**
  - [ ] Build interactive name and emoji entry.
  - [ ] Implement confirmation and configuration phase.
  - [ ] Animate the "3-2-1" ASCII countdown.
- **Status:** Not Started

### 6. Tagging Mechanics & Interaction Windows
*Implement the complex "It" logic and timing constraints.*
- **Progress:**
  - [ ] Add 2-second `TAGGING_WINDOW` timer.
  - [ ] Build `PLAYER_SELECTION` hotkey menu.
  - [ ] Implement tag penalty (teleportation/turn-skip).
- **Status:** Not Started

### 7. Web Audio API Synthesis
*Create the `Audio Engine` using wave oscillators for PC-speaker sound.*
- **Progress:**
  - [ ] Build `BeeperSynth` for wave synthesis.
  - [ ] Implement movement "boops" and countdown "beeps".
  - [ ] Create victory fanfare and menu melodies.
- **Status:** Not Started

### 8. Procedural VFX & Final Polish
*Integrate background animations and finalize the game lifecycle.*
- **Progress:**
  - [ ] Implement procedural heart backgrounds.
  - [ ] Build rainbow background animations.
  - [ ] Ensure endless loop stability and reset logic.
- **Status:** Not Started

---

## Commit History (Roadmap)

Every commit should be between 50-200 lines and contribute to a functional prototype.

1.  **Commit 1:** Initialize NPM, project folder structure, and install core dev-dependencies (Vite, TypeScript).
2.  **Commit 2:** Create `index.html` and a basic "CRT" CSS file (scanlines, VGA colors, IBM font).
3.  **Commit 3:** Configure Vite for development and add a `main.ts` entry point that logs "Blampotag Init".
4.  **Commit 4:** Setup Jasmine with a basic `identity-test.spec.ts` for the reducer.
5.  **Commit 5:** Define the initial `GameState` type and a `PHASE.NAME_ENTRY` constant.
6.  **Commit 6:** Create the `CharacterBuffer` type and a basic renderer that clears the screen.
7.  **Commit 7:** Implement a FIGlet-style "BLAMPOTAG" title asset and render it to the top of the screen.
8.  **Commit 8:** Create `KeyboardManager` to capture and log keydown events in the browser console.
9.  **Commit 9:** Implement `rootReducer` to handle a `TICK` event (initial integration).
10. **Commit 10:** Implement the `MainLoop` using `requestAnimationFrame` to keep the engine running.
11. **Commit 11:** Add a `Player` type and an empty `players` array to the `GameState`.
12. **Commit 12:** Implement a border-drawing function using box-drawing characters in the renderer.
13. **Commit 13:** Add a "dummy" player to the state and render their emoji on the grid.
14. **Commit 14:** Bind arrow keys to `MOVE` events and update the player position in the reducer.
15. **Commit 15:** Implement `isValidMove` logic to prevent players from leaving the board boundaries.
16. **Commit 16:** Add `PHASE.CONFIRMATION` to the state and implement a transition from Name Entry.
17. **Commit 17:** Build an interactive Name Entry screen that captures keyboard input for names.
18. **Commit 18:** Initialize the `AudioEngine` (Web Audio API) triggered by the first user interaction.
19. **Commit 19:** Play a simple "PC Speaker" beep whenever a `MOVE` event is processed.
20. **Commit 20:** Implement `PHASE.PRE_GAME_COUNTDOWN` logic (decrementing timer in the reducer).
21. **Commit 21:** Render large, animated ASCII numbers during the countdown phase.
22. **Commit 22:** Implement `getRandomizedPositions` to place players randomly on game start.
23. **Commit 23:** Update movement logic in the reducer to support diagonal steps.
24. **Commit 24:** Implement the "blocky wipe" transition logic (pure function returning an intermediate buffer).
25. **Commit 25:** Hook up the transition progress to the main loop to trigger wipes during phase changes.
26. **Commit 26:** Implement collision detection between the "It" player and others in the reducer.
27. **Commit 27:** Transition state to `PHASE.TAGGING_WINDOW` when a collision is detected.
28. **Commit 28:** Implement the 2-second countdown for the tagging window in the `TICK` handler.
29. **Commit 29:** Render a "PRESS ENTER TO TAG" overlay when in the tagging phase.
30. **Commit 30:** Handle the `ENTER` key specifically during the tagging window to confirm a tag.
31. **Commit 31:** Implement the penalty logic: teleport the "It" player back if they miss the tag window.
32. **Commit 32:** Implement `PHASE.PLAYER_SELECTION` for cases with multiple potential targets.
33. **Commit 33:** Update the reducer to transfer the "It" status to the selected player on success.
34. **Commit 34:** Implement `PHASE.CELEBRATION` logic and a victory state transition.
35. **Commit 35:** Create a procedural "Hearts" background animation logic in `animations.ts`.
36. **Commit 36:** Integrate the victory fanfare in the `AudioEngine` for tag successes.
37. **Commit 37:** Implement the "Reset" logic to return the game to a new round after celebration.
38. **Commit 38:** Create a procedural "Rainbow" background animation for the celebration phase.
39. **Commit 39:** Add high-contrast character highlighting for the current player and the "It" player.
40. **Commit 40:** Final polish: Add CRT scanline flickering and finalize the endless game loop.
