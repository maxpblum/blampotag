Prompt:

There's a whole bunch of code in @src/engine/main-loop.ts that belongs in other modules: Rendering code (especially),
   transition-rendering-related code, hearts-and-rainbows-related code, audio signal code. Literally the only thing the main loop should
   do is hold the current state, set up event triggers (time loop, keyboard manager), get the new state on each event by calling the
   reducer, and then passing the new state (and possibly the previous state, if necessary) to the rendering function. The rendering
   function should tell the audio logic something vague, like "play move sound effect", not something specific like a frequency. The
   rendering logic should also, obviously, be in charge of rendering transitions and effects. Also, every single function or class
   exported from any .ts file should be thoroughly unit tested: Not just a trivial test, but tests of every behavior, ultimately
   representing every code path. The audio logic, engine logic, event trigger creation logic, and rendering logic should all accept any
   side-effect-receiving objects (like the container) as arguments for explicit mocking in unit tests. The reducer should be a pure
   function and shouldn't require any mocking.

# Refactoring Plan: Modular Game Engine and Decoupled Rendering

## 1. Overview
The goal of this refactoring is to decouple the game logic from the rendering and audio subsystems in `src/engine/main-loop.ts`. This will improve maintainability, separation of concerns, and enable thorough unit testing through dependency injection.

### Core Goals
- **Decoupled Rendering**: Move all buffer-building, phase-specific rendering, transitions (blocky wipe), and visual effects (hearts/rainbows) to a dedicated `GameRenderer` module.
- **Abstracted Audio**: Create a high-level `GameAudio` interface that uses semantic signals (e.g., `playMoveSound`) rather than implementation details (e.g., `beep(440)`).
- **Lean Main Loop**: The `MainLoop` (or `GameController`) will strictly manage state, event triggers (tick/input), and orchestration.
- **Testability**: Every class and function will be designed for unit testing via dependency injection of side-effect-receiving objects (e.g., `HTMLElement`, `AudioContext`).
- **Complete Test Coverage**: Every exported symbol will have exhaustive unit tests covering all code paths.

---

## 2. Architecture

### 2.1 GameAudio (`src/audio/game-audio.ts`)
A high-level wrapper around the low-level `AudioEngine`.
- **Interface**: `AudioEffectPlayer`
    - `playMove()`
    - `playFanfare()`
    - `playTag()`
    - `playSelect()`
    - `init()`
- **Implementation**: `WebAudioPlayer`
    - Accepts `AudioEngine` as a dependency.
    - Maps semantic actions to specific frequencies and durations.

### 2.2 GameRenderer (`src/rendering/game-renderer.ts`)
Encapsulates all logic for transforming `GameState` into pixels (or characters).
- **Class**: `GameRenderer`
    - **Constructor**: Accepts `container: HTMLElement` and `audio: AudioEffectPlayer`.
    - **Method**: `render(state: GameState, previousState: GameState | null, totalTime: number)`
    - **Responsibilities**:
        - Orchestrate rendering of the current phase.
        - Handle transitions (blocky wipe) if `transitionProgress < 1.0`.
        - Apply overlay effects (rainbow, hearts) for `CELEBRATION` phase.
        - **Trigger audio effects** (e.g., `audio.playMove()`, `audio.playFanfare()`) by comparing `state` and `previousState` or checking for state-driven events. This ensures the "vague" signal requirement.

### 2.3 Event Trigger Creation Logic (`src/input-and-time-event-logic/`)
- **Ticker (`ticker.ts`)**: Encapsulates `requestAnimationFrame`.
    - Accepts a `tickCallback`.
    - Accepts a `timeSource` (e.g., `window`) for mocking `requestAnimationFrame`.
- **KeyboardManager (`keyboard.ts`)**: 
    - Updated to accept a `target: EventTarget` (e.g., `window`) in the constructor to allow explicit mocking.

### 2.4 GameController (`src/engine/main-loop.ts`)
The slimmed-down heart of the engine, designed for **absolute minimalism**. It acts strictly as an orchestrator, delegating all domain-specific logic to specialized modules.
- **Responsibilities (Strictly Limited)**:
    - **State Management**: Own the `GameState` and invoke the `rootReducer`.
    - **Time Tracking**: Maintain `totalTime` and `lastTimestamp`.
    - **Orchestration**: Coordinate the `Ticker` and `KeyboardManager` to trigger updates.
    - **Delegation**: Pass the new (and previous) state to the `GameRenderer` for all side effects.
- **Explicitly Delegated Logic (Removed from MainLoop)**:
    - **Rendering**: All buffer building and phase-specific layout.
    - **Transitions**: Blocky wipe and buffer blending.
    - **Visual Effects**: Celebration animations (hearts, rainbows).
    - **Audio Signals**: All logic for *when* to play sounds and *what* sounds to play.
    - **Input Mapping**: Mapping raw keys to semantic `GameEvent`s.
- **Dependencies (Injected)**:
    - `GameRenderer`
    - `KeyboardManager`
    - `Ticker`
    - `initialState`

---

## 3. Implementation Details

### 3.1 Decoupling Input
Move the `onKeyPress` logic to a mapper function or a dedicated class that turns keyboard keys into `GameEvent` objects. This allows testing the controller by simply feeding it events.

### 3.2 Mocking Side Effects
- **DOM**: Use a mock `HTMLElement` or `jsdom` in tests for the `GameRenderer`.
- **Audio**: Use a mock `AudioEffectPlayer` to verify that the renderer or controller triggers the correct sounds without actually initializing an `AudioContext`.
- **Time/Events**: Use a mock `Ticker` and mock `EventTarget` for the `KeyboardManager` to verify that events are correctly wired up.

---

## 4. Testing Strategy

### 4.1 Unit Tests for `GameRenderer`
- Verify that `renderPhase` logic produces the correct `CharacterBuffer` for each `PHASE`.
- Verify that transitions correctly blend two buffers.
- Verify that `overlayHearts` and `overlayRainbow` are called during `CELEBRATION`.
- **Audio Triggering**: Verify that `audio.playMove()` is called when the state shows a move occurred, etc.
- **Mocking**: Mock `writeStringToBuffer`, `drawBox`, and `renderToContainer` to verify calls and parameters.

### 4.2 Unit Tests for `GameController`
- Verify that `TICK` events update the state via the reducer.
- Verify that keyboard events trigger the correct reducer actions.
- Verify that `render()` is called on the injected `GameRenderer` with the correct arguments (including `previousState`).
- Verify that `getState()` returns the current state.

### 4.3 Unit Tests for `GameAudio`
- Verify that `playMove()` calls the underlying `AudioEngine.beep` with the expected parameters.
- Verify that `init()` is called only once.

### 4.4 Unit Tests for `Ticker` and `KeyboardManager`
- Verify that `Ticker` starts the loop and calls the callback.
- Verify that `KeyboardManager` adds/removes listeners from the injected `target`.

---

## 5. Step-by-Step Execution

1.  **Extract Audio**: Implement `src/audio/game-audio.ts` and its interface. **Update `AudioEngine` to accept `AudioContext` as an optional dependency** in its constructor/init to satisfy the DI requirement.
2.  **Extract Ticker/Keyboard**: Create `src/input-and-time-event-logic/ticker.ts` and update `keyboard.ts` to be fully injectable (accept `target: EventTarget`).
3.  **Extract Rendering**: Create `src/rendering/game-renderer.ts`. Move all rendering constants (`GRID_CELL_WIDTH`, etc.) and the `renderPhase` logic there. Ensure it handles audio triggers by comparing `state` and `previousState`.
4.  **Refactor MainLoop**: Simplify `src/engine/main-loop.ts` to accept the new `GameRenderer`, `Ticker`, and `KeyboardManager` as dependencies. Remove all rendering and audio-specific logic.
5.  **Update Entry Point**: Update `src/main.ts` to instantiate and wire up the new modules.
6.  **Exhaustive Unit Testing**: Write `.spec.ts` files for all new modules, achieving 100% path coverage for all exported symbols.
7.  **Validation**: Run existing E2E Playwright tests to ensure no regressions in game behavior or visual fidelity.
