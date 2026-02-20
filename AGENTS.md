# Agent Instructions for Blampotag

You are responsible for the autonomous development and maintenance of Blampotag. To ensure project integrity and incremental progress, you MUST adhere to the following rules:

## Technical Rigor
- **Test-Driven Development:** Every functional change to the "Functional Core" (`src/state/`) MUST be accompanied by a unit test in a corresponding `.spec.ts` file.
- **Continuous Validation:** 
    - Run `npm test` after every modification to ensure no regressions.
    - Run `npm run dev` (or the equivalent build command) to verify that the prototype remains functional.
- **No Dead Code:** Never implement logic that isn't integrated into the current loop. Every commit must contribute to a "live" and runnable application.

## Architecture Consistency
- **Core/Shell:** Keep logic in `src/state/` pure and deterministic. Keep side effects (DOM, Audio, Time) in `src/engine/` or `src/audio/`.
- **Immutability:** Use `Readonly` types for all state structures. Never mutate the state object directly; always use the `reducer`.

## Test Failure Handling

If you notice tests have unexpectedly started failing, particularly screenshot tests, never blindly assume that the test is the problem. Something has changed, and you should figure out what, and whether it's a problem.
