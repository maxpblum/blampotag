# Blampotag: Project Deliverables & Roadmap

This document tracks the progress of Blampotag. It follows a "Functional Core, Imperative Shell" architecture, ensuring that every commit results in a working, integrated prototype.

## Deliverables Status

### 1. Development Environment & Infrastructure
*Establish the project foundation using `npm init`, Vite, TypeScript (Strict mode), and Jasmine.*
- **Progress:**
  - [x] Initialize NPM and project structure.
  - [x] Configure Vite for static serving.
  - [x] Set up the "CRT/DOS" CSS shell.
  - [x] Integrate Jasmine for unit testing.
- **Status:** Completed

### 2. Core Game State & Logic (Functional Core)
*Implement the `Readonly GameState` and the pure `reducer` function.*
- **Progress:**
  - [x] Define `GameState`, `Player`, and `Phase` types.
  - [x] Implement pure `rootReducer` for state transitions.
  - [x] Add movement, boundary, and collision logic.
  - [x] Verify all logic with Jasmine tests.
- **Status:** Completed

### 3. Input Handling & Engine Orchestration (Imperative Shell)
*Build the `KeyboardManager` and the global `requestAnimationFrame` loop.*
- **Progress:**
  - [x] Create `KeyboardManager` with "press-and-held" logic.
  - [x] Implement `runEngine` loop to maintain mutable state.
  - [x] Connect input events to the state reducer.
- **Status:** Completed

### 4. DOS-Themed Rendering Engine
*Develop the `buffer-renderer` and ASCII asset library.*
- **Progress:**
  - [x] Implement `CharacterBuffer` renderer for DOM `<pre>`.
  - [x] Create FIGlet-style title and box-drawing assets.
  - [x] Build DOS-style transition effects (wipes/fades).
- **Status:** Completed

### 5. Initialization & Setup Flow
*Implement the game's start-up phases: `NAME_ENTRY`, `CONFIRMATION`, and `PRE_GAME_COUNTDOWN`.*
- **Progress:**
  - [x] Build interactive name and emoji entry.
  - [x] Implement confirmation and configuration phase.
  - [x] Animate the "3-2-1" ASCII countdown.
- **Status:** Completed

### 6. Tagging Mechanics & Interaction Windows
*Implement the complex "It" logic and timing constraints.*
- **Progress:**
  - [x] Add 2-second `TAGGING_WINDOW` timer.
  - [x] Build `PLAYER_SELECTION` hotkey menu.
  - [x] Implement tag penalty (teleportation/turn-skip).
- **Status:** Completed

### 7. Web Audio API Synthesis
*Create the `Audio Engine` using wave oscillators for PC-speaker sound.*
- **Progress:**
  - [x] Build `BeeperSynth` for wave synthesis.
  - [x] Implement movement "boops" and countdown "beeps".
  - [x] Create victory fanfare and menu melodies.
- **Status:** Completed

### 8. Procedural VFX & Final Polish
*Integrate background animations and finalize the game lifecycle.*
- **Progress:**
  - [x] Implement procedural heart backgrounds.
  - [x] Build rainbow background animations.
  - [x] Ensure endless loop stability and reset logic.
- **Status:** Completed
