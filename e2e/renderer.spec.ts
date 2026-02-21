import { test, expect } from '@playwright/test';
import { PHASE } from '../src/state/game-state';

test.describe('Renderer Screenshot Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Only run these tests on the 'normal' project
    if (testInfo.project.name !== 'chromium-desktop-partial') {
      test.skip();
    }
    // Navigate to our renderer test page
    await page.goto('http://localhost:5173/app/render-test.html');
    await page.waitForFunction(() => (window as any).renderState !== undefined);
  });

  const DEFAULT_BOARD = { width: 10, height: 10 };
  const PLAYER_1 = { id: '1', name: 'Alice', emoji: '🧙', x: 2, y: 2, startOfTurnX: 2, startOfTurnY: 2, isIt: true, moveCount: 1 };
  const PLAYER_2 = { id: '2', name: 'Bob', emoji: '🧛', x: 5, y: 5, startOfTurnX: 5, startOfTurnY: 5, isIt: false, moveCount: 1 };

  const baseState = {
    phase: PHASE.ADD_PLAYER_NAME,
    players: [],
    turnIndex: 0,
    boardConfig: DEFAULT_BOARD,
    countdownTimer: 0,
    transitionProgress: 1.0,
    oldPhase: null,
    avatarSelectionIndex: 0,
    pendingPlayerName: ""
  };

  test('ADD_PLAYER_NAME phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.ADD_PLAYER_NAME,
      pendingPlayerName: "Alice"
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('add-player-name.png');
  });

  test('CHOOSE_PLAYER_AVATAR phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.CHOOSE_PLAYER_AVATAR,
      pendingPlayerName: "Alice",
      avatarSelectionIndex: 2
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('choose-avatar.png');
  });

  test('CONFIRMATION phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.CONFIRMATION,
      players: [PLAYER_1, PLAYER_2]
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('confirmation.png');
  });

  test('ROUND phase - IT turn', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.ROUND,
      players: [PLAYER_1, PLAYER_2],
      turnIndex: 0
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('round-it-turn.png');
  });

  test('ROUND phase - with recent move highlight', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.ROUND,
      players: [PLAYER_1, PLAYER_2],
      turnIndex: 1,
      lastMove: { fromX: 2, fromY: 2, toX: 3, toY: 2 }
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('recent-move.png');
  });

  test('ROUND phase - non-IT turn', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.ROUND,
      players: [PLAYER_1, PLAYER_2],
      turnIndex: 1
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('round-non-it-turn.png');
  });

  test('FIRST_TURN_PROMPT phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.FIRST_TURN_PROMPT,
      players: [PLAYER_1, PLAYER_2],
      turnIndex: 0,
      pendingMove: { dx: 1, dy: 0 }
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('first-turn-prompt.png');
  });

  test('TAGGING_WINDOW phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.TAGGING_WINDOW,
      players: [{ ...PLAYER_1, x: 5, y: 5 }, PLAYER_2],
      turnIndex: 0,
      countdownTimer: 1500
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('tagging-window.png');
  });

  test('PLAYER_SELECTION phase', async ({ page }) => {
    const p3 = { ...PLAYER_2, id: '3', name: 'Charlie', emoji: '👻', x: 5, y: 5 };
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.PLAYER_SELECTION,
      players: [{ ...PLAYER_1, x: 5, y: 5 }, PLAYER_2, p3],
      turnIndex: 0
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('player-selection.png');
  });

  test('CELEBRATION phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.CELEBRATION,
      players: [PLAYER_1, PLAYER_2],
      countdownTimer: 3000
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('celebration.png');
  });

  test('PRE_GAME_COUNTDOWN phase', async ({ page }) => {
    await page.evaluate((state) => (window as any).renderState(state), {
      ...baseState,
      phase: PHASE.PRE_GAME_COUNTDOWN,
      countdownTimer: 2500
    });
    await expect(page.locator('#game-output')).toHaveScreenshot('countdown-3.png');
  });
});
