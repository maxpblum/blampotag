# Blampotag: Detailed Implementation Plan

## 1. Project Overview
Blampotag is a DOS-themed, turn-based computer game version of Tag. It features a checkers-style grid board where players move to tag one another. The game emphasizes a "functional core, imperative shell" architecture, immutable data structures, and a rigorous behavior-driven testing suite.

## 2. Technical Stack & Tooling
- **Language:** TypeScript (Strict mode).
- **Runtime:** Static Web Page (Vanilla JS, no frameworks).
- **Bundler/Dev Server:** Vite.
- **Testing:** Jasmine (Unit tests located next to their respective source files).
- **Styling:** CSS for "DOS" aesthetic (solid VGA colors, IBM VGA 8x16 font).
- **Audio:** Web Audio API for PC-speaker style synthesis.

## 3. Architecture: Functional Core, Imperative Shell
- **Functional Core (`src/state/`):** Pure functions that transform a `Readonly` state based on `Events`.
- **Imperative Shell (`src/engine/`):** A global loop (via `requestAnimationFrame`) that maintains the mutable state reference, handles DOM I/O, timing, and triggers rendering/audio.

## 4. Folder Structure & Module Responsibilities
- **`app/`**: Static entry points (`index.html`, `main.css`).
- **`src/engine/`**: The global loop, state orchestration, and shell-level tests.
- **`src/state/`**: The `GameState` type (all fields `readonly`) and the `reducer` function. Contains all board logic (movement, collisions, boundaries).
- **`src/dos-themed-rendering/`**: Maps state to a character buffer. Handles ASCII art, animations (hearts/rainbows), and screen transitions (wipes/fades).
- **`src/input-and-time-event-logic/`**: Maps raw DOM events (Keyboard, Time) to semantic `GameEvents`. Handles "press-and-held" logic to ensure single-keystroke behavior.
- **`src/audio/`**: Web Audio API synthesizers and melodic patterns for different game phases.

## 5. Game Rules & Logic
- **Board:** Configurable grid size.
- **Players:** 2 to (Total Squares) players. Each has a name and an avatar (Modern Unicode emojis allowed).
- **Movement:**
  - One space straight or diagonal per turn.
  - **First Turn Perk:** On the first turn of a new round, a player can move two spaces in one direction (if space permits, via Y/N prompt).
  - **Boundaries:** Moves outside the board are rejected.
  - **Collisions:** Non-"It" players can share squares.
- **Tagging Mechanic:**
  - If "It" lands on a square with other players:
    - 2-second window to press `Enter`.
    - If `Enter` is pressed: If multiple targets, "It" chooses one by pressing a corresponding hotkey (e.g., '1', '2', '3') displayed on screen (no time limit). Targeted player becomes "It".
    - If time expires: "It" teleports back to their **start-of-turn position** and their turn is skipped.
- **Rounds:** New rounds start after a tag. Pieces are randomized, but "It" never starts on an occupied square. Endless loop.

## 6. UI & Visuals (The "DOS" Vibe)
- **Title:** FIGlet-style "Blampotag" ASCII art, always visible at the top.
- **Board Rendering:** ASCII box-drawing characters (`╔══╗`, `║`, `╚══╝`).
- **Animations:** Procedural background animations of hearts and rainbows using the 16-color CGA/EGA palette.
- **Clarity:** High-contrast highlights for the current player and the "It" player.
- **Transitions:** Screen changes (e.g., Title -> Config -> Countdown) use "cool" DOS-era effects like blocky wipes or character-by-character fades. These are driven by `transitionProgress` in the `GameState`.

## 7. Audio System
- **Synthesis:** Square/Triangle wave oscillators for "PC Speaker" crunch.
- **Soundtrack:**
  - **Initialization/Menu:** Bouncy, inviting melody.
  - **Round:** Minimalist, rhythmic "boops" for movement.
  - **Tagging Window:** High-speed, tense pulse.
  - **Countdown:** Ascending "beeps".
  - **Celebration:** Triumphant, descending 8-bit fanfare.
- **SFX:** Specific sounds for board edge hits, successful tags, and the 2-second window expiration.

## 8. Game Phases
1.  **INITIALIZATION**: 
    - `NAME_ENTRY`: Entering player names and choosing emojis.
    - `CONFIRMATION`: "Start the game with these players" or adjust config.
2.  **PRE_GAME_COUNTDOWN**: Big "3-2-1" ASCII animation.
3.  **ROUND**: Standard movement and turn-taking.
4.  **TAGGING_WINDOW**: The 2-second timer and `Enter` prompt.
5.  **PLAYER_SELECTION**: Menu with hotkeys (1, 2, 3...) to pick a target if multiple players are in the square.
6.  **CELEBRATION**: Tag success screen with intense heart/rainbow animations.
7.  **RESET**: Brief pause before pieces are randomized for the next round.

## 9. Testing Strategy (Jasmine)
- **Location:** `filename.spec.ts` next to `filename.ts`.
- **Scope:** 50-200 line files.
- **Behavior-Driven:** Tests focus on outcomes (e.g., "should teleport 'It' back if they miss the tag window") rather than internal implementation details.
- **Readability:**
  - Use semantically named helper functions for setup.
  - Explicit data in assertions: `expect(reducer({...state, itPlayerX: 0}, EVENT)).toEqual({...expected, itPlayerX: 1})`.
  - Jasmine `clock()` for time-based behaviors.

## 10. Implementation Roadmap & Tooling
- **Tooling Requirement:** Use official `init` scripts where available (`npm init`, `npx vite init`, `npx jasmine init`).
- **Dependency Management:** NEVER guess versions in `package.json`. Use `npm install --save` or `npm install --save-dev` to fetch the latest stable versions.
- **Roadmap:**
  1.  **Phase 1: Environment**: `npm init`, setup Vite, TS, Jasmine. Character buffer & DOS CSS.
  2.  **Phase 2: Core State**: `Readonly GameState`, `reducer`. Movement, collisions, boundaries (with tests).
  3.  **Phase 3: Input & Loop**: `KeyboardManager` (press-and-held), `installLoop`.
  4.  **Phase 4: DOS Rendering**: Character buffer rendering, FIGlet assets, transition effects (wipe/fade).
  5.  **Phase 5: Initialization Flow**: `NAME_ENTRY` and `CONFIRMATION` logic.
  6.  **Phase 6: Tagging & Timers**: 2-second window, retraction (teleport back), hotkey selection.
  7.  **Phase 7: Audio & Polish**: Web Audio patterns, heart/rainbow VFX, endless loop validation.

## 11. System Interfaces & Exports

### Functional Core (`src/state/`)
- **`game-state.ts`**
  - `GameState`: `Readonly` object (players, board, turn index, timer, phase, `transitionProgress`).
  - `Player`: `Readonly` object (`id`, `name`, `emoji`, `position`, `startOfTurnPosition`, `isIt`).
  - `Phase`: Union (`NAME_ENTRY`, `CONFIRMATION`, `ROUND`, `TAGGING_WINDOW`, `PLAYER_SELECTION`, etc.).
- **`reducer.ts`**
  - `rootReducer(state: GameState, event: GameEvent)`: Pure state transformation.
  - `GameEvent`: `TICK(dt)`, `MOVE(dir)`, `KEY_PRESS(key)`, `RESET`.
- **`board-logic.ts`**
  - `isValidMove`, `getRandomizedPositions`.

### Visuals & Presentation (`src/dos-themed-rendering/`)
- **`buffer-renderer.ts`**
  - `renderState(state: GameState, container: HTMLElement, audioEngine: AudioEngine)`: (Exported Function) The presentation entry point. It calculates the character buffer, updates the DOM, and determines which audio triggers to send to the `Audio Engine`.
  - `CharacterBuffer`: (Exported Type) A 2D `Readonly` array of `Cell` (char + color).
- **`transitions.ts`**
  - `getTransitionBuffer(oldBuf, newBuf, progress, type)`: (Exported Function) Purely blends two screens using DOS-style effects.
- **`ascii-assets.ts`**
  - `FIGLET_FONTS`, `BOX_CHARS`: (Exported Objects) Static ASCII templates.
- **`animations.ts`**
  - `overlayVfx(buffer, ticks)`: (Exported Function) Returns a buffer with heart/rainbow overlays.

### Input & Timing (`src/input-and-time-event-logic/`)
- **`keyboard.ts`**: `KeyboardManager` (Polls keys, filters repeats).
- **`timer.ts`**: `installLoop(callback)`.

### Audio (`src/audio/`)
- **`audio-engine.ts`** (Dependency of Rendering)
  - `BeeperSynth`: (Exported Class) PC-speaker synthesis.
  - `playTrigger(trigger: AudioTrigger)`: (Exported Function) Plays a specific sound effect or starts/stops a music pattern.
  - `AudioTrigger`: (Exported Type) Union of sound events (e.g., `MOVE_HIT_WALL`, `TAG_SUCCESS`, `START_MUSIC_CELEBRATION`).

### Engine (`src/engine/`)
- **`main-loop.ts`**
  - `runEngine`: Orchestrates the `Functional Core` (Reducer) and the `Presentation Layer` (Rendering). It maintains the mutable state reference.

## 12. System Architecture & State Flow

### System Diagram (ASCII)

```text
+-----------------------------------------------------------------------+
|                           IMPERATIVE SHELL                            |
|                                                                       |
|  +-----------------------+           +-----------------------------+  |
|  | KeyboardManager       |           | AnimationFrameLoop (timer)  |  |
|  | (Captures keystrokes) |           | (Provides dt)               |  |
|  +-----------+-----------+           +--------------+--------------+  |
|              |                                      |                 |
|              | [GameEvent]                          | [GameEvent]     |
|              v                                      v                 |
|  +-----------------------------------------------------------------+  |
|  |                          MAIN ENGINE LOOP                       |  |
|  |  (Maintains current mutable reference to Readonly GameState)    |  |
|  +-----------+--------------------------------------+--------------+  |
|              |                                      |                 |
|      [State, Event]                        [New State]                |
|              v                                      v                 |
|  +---------------------------+       +-----------------------------+  |
|  |      FUNCTIONAL CORE      |       |      DOS RENDERING          |  |
|  |  (Pure Reducer Logic)     |       | (Presentation Layer)        |  |
|  +---------------------------+       +-------+--------------+------+  |
|                                              |              |         |
|                                [Character    |              | [Audio  |
|                                 Buffer Data] |              |  Triggers]
|                                              v              v         |
|                                      +-------------+  +-------------+ |
|                                      |     DOM     |  | AUDIO ENGINE| |
|                                      | (The <pre>) |  | (Synth/SFX) | |
|                                      +-------------+  +-------------+ |
+-----------------------------------------------------------------------+
```

### State Flow & Lifecycle Explanation

1.  **Input Processing**: The `KeyboardManager` and `AnimationFrameLoop` (Imperative Shell) generate `GameEvents` (like `MOVE` or `TICK`).
2.  **State Transformation**: The `Main Engine Loop` passes the current `state` and the `event` to the `Functional Core` (the `Reducer`). The `Reducer` is a pure function that returns a brand new `Readonly GameState`. No side effects occur here.
3.  **Presentation Orchestration**: The `Engine` then passes this `New State` to the `DOS RENDERING` module.
4.  **Visual Output**: `Rendering` maps the state to a `CharacterBuffer`. If a transition is active (`state.transitionProgress`), it uses the `transitions` module to blend buffers. Finally, it performs the imperative act of writing this text to the `DOM` (the `<pre>` element).
5.  **Audio Output**: Simultaneously, the `Rendering` module evaluates the state to determine if any sounds should be played (e.g., if the `phase` just transitioned to `CELEBRATION`). It sends an `AudioTrigger` (not characters!) to the `AUDIO ENGINE`.
6.  **Loop Closure**: The `Engine` saves the `New State` as its current reference and waits for the next frame. This separation ensures the game logic is testable in isolation, while the "messy" details of DOM updates and Audio synthesis are contained within the presentation shell.
