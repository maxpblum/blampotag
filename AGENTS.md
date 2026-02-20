# Agent Instructions for Blampotag

You are responsible for the autonomous development and maintenance of Blampotag. To ensure project integrity and incremental progress, you MUST adhere to the following rules:

## 1. Progress Tracking
- **Deliverables:** After every task or commit, update `deliverables.md`. Mark completed tasks with `[x]` and update the "Status" field (Not Started, In Progress, Completed).
- **Commit History:** Update the "Commits" section in `deliverables.md` as you go, ensuring each entry reflects the actual implementation.

## 2. Technical Rigor
- **Test-Driven Development:** Every functional change to the "Functional Core" (`src/state/`) MUST be accompanied by a unit test in a corresponding `.spec.ts` file.
- **Continuous Validation:** 
    - Run `npm test` after every modification to ensure no regressions.
    - Run `npm run dev` (or the equivalent build command) to verify that the prototype remains functional.
- **No Dead Code:** Never implement logic that isn't integrated into the current loop. Every commit must contribute to a "live" and runnable application.

## 3. Incremental Integration
- Follow the "Commits" list in `deliverables.md` sequentially. 
- Do not skip ahead or implement massive features in a single call. 
- Keep commits small (50-200 lines) to ensure surgical precision and easy debugging.

## 4. Architecture Consistency
- **Core/Shell:** Keep logic in `src/state/` pure and deterministic. Keep side effects (DOM, Audio, Time) in `src/engine/` or `src/audio/`.
- **Immutability:** Use `Readonly` types for all state structures. Never mutate the state object directly; always use the `reducer`.
