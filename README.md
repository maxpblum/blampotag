# Blampotag

**Play the Game:** [https://maxpblum.github.io/blampotag/](https://maxpblum.github.io/blampotag/)

**Blampotag** is a DOS-themed, turn-based version of Tag played on a checkers-style grid. It features a "Functional Core, Imperative Shell" architecture, a solid VGA-style aesthetic, and procedural ASCII animations. **This project was vibe coded using Gemini CLI and Gemini 3 Flash Preview.**

## Inspiration
Blampotag was inspired by a request for a computer game version of Tag that feels like a board game. The rules mirror the strategic turn-taking of checkers, where players move pieces across a grid to tag one another.

## How to Play

### Rules
- **The Board:** A configurable grid where players take turns moving.
- **Players:** 2 or more players, each with a name and an emoji avatar.
- **Movement:** 
  - Move one space per turn using the **3x3 directional grid** (`QWE/AD/ZXC`).
  - **First Turn Perk:** On your very first move, you can move **two spaces** instead of one by using the **outer directional grid** (`RTY/FGH/VBN`).
  - Letter overlays appear on the board to show exactly which key moves you to which square.
  - Moves outside the board are rejected.
- **The "It" Mechanic:**
  - One player is designated as "It".
  - If "It" lands on a square occupied by other players, they have a **2-second window** to press `Enter` to tag them.
  - If multiple players are in the square, "It" must select a target using the displayed hotkeys (e.g., `1`, `2`, `3`).
  - If the 2-second window expires without a tag, "It" is teleported back to their starting position for that turn, and their turn is skipped.
- **Rounds:** After a successful tag, the tagged player becomes "It" and a new round begins with pieces randomized across the board.

### Controls
- **`Q`, `W`, `E`, `A`, `D`, `Z`, `X`, `C`:** Move your piece (1 space).
- **`R`, `T`, `Y`, `F`, `H`, `V`, `B`, `N`:** Move your piece (2 spaces, **first turn only**).
- **`Enter`:** Execute a tag during the 2-second window, or confirm selections during setup.
- **`A` / `D`:** Navigate avatar selection during setup.
- **`1`-`9`:** Select a player to tag when multiple targets are available.
- **`=` / `-`:** Increase or decrease board width (during configuration).
- **`[` / `]`:** Increase or decrease board height (during configuration).
- **`A` (during setup):** Add another player (during configuration).

---

## Technical Architecture

The project follows a **Functional Core, Imperative Shell** pattern to separate game logic from side effects.

### 1. Functional Core (`src/state/`)
The core game logic is contained in a pure reducer.
- **Immutable State:** The `GameState` and all its nested objects are `Readonly`.
- **Pure Reducer:** The `rootReducer` takes the current state and a `GameEvent`, returning a new state. This handles movement validation, collision detection, and tagging logic.

### 2. Imperative Shell (`src/engine/` & `src/dos-themed-rendering/`)
Side effects such as I/O, DOM updates, and Audio are isolated in the shell.
- **Engine Loop:** A `requestAnimationFrame` loop manages the state and orchestrates the flow.
- **Input Handling:** A `KeyboardManager` handles raw input events.
- **Rendering:** A buffer-based renderer maps the game state to a character buffer, applying DOS-style transitions and animations.
- **Audio:** The **Web Audio API** synthesizes PC-speaker style sounds for movement, countdowns, and celebrations.

---

## Repository Structure

```text
├── app/                        # Static entry points (HTML/CSS)
├── spec/                       # Jasmine configuration and support
└── src/
    ├── audio/                  # Web Audio API synthesizers
    ├── dos-themed-rendering/    # Buffer renderer, ASCII assets, & VFX
    ├── engine/                 # Main game loop and orchestration
    ├── input-and-time-event-logic/ # Keyboard management
    └── state/                  # Functional core: state types & reducer
```

## Development

### Setup
Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# Install dependencies
npm install

# Start the development server (Vite)
npm run dev

# Run unit tests
npm test
```

### Aesthetic & Style
- **Visuals:** FIGlet-style ASCII titles and a solid 16-color CGA/EGA palette.
- **Dependencies:** Built with vanilla TypeScript and Vite.
