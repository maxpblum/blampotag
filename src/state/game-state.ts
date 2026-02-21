export enum PHASE {
    ADD_PLAYER_NAME = "ADD_PLAYER_NAME",
    CHOOSE_PLAYER_AVATAR = "CHOOSE_PLAYER_AVATAR",
    CONFIRMATION = "CONFIRMATION",
    PRE_GAME_COUNTDOWN = "PRE_GAME_COUNTDOWN",
    ROUND = "ROUND",
    FIRST_TURN_PROMPT = "FIRST_TURN_PROMPT",
    TAGGING_WINDOW = "TAGGING_WINDOW",
    PLAYER_SELECTION = "PLAYER_SELECTION",
    CELEBRATION = "CELEBRATION",
    RESET = "RESET",
}

export type Player = {
    readonly id: string;
    readonly name: string;
    readonly emoji: string;
    readonly x: number;
    readonly y: number;
    readonly startOfTurnX: number;
    readonly startOfTurnY: number;
    readonly isIt: boolean;
    readonly moveCount: number;
};

export type BoardConfig = {
    readonly width: number;
    readonly height: number;
};

export type GameState = {
    readonly phase: PHASE;
    readonly players: readonly Player[];
    readonly turnIndex: number; // During setup, this is the index of the player being created
    readonly boardConfig: BoardConfig;
    readonly countdownTimer: number;
    readonly transitionProgress: number; 
    readonly oldPhase: PHASE | null;
    readonly avatarSelectionIndex: number;
    readonly pendingPlayerName: string;
    readonly pendingMove?: { dx: number; dy: number };
};

export const AVAILABLE_EMOJIS = ["🧙", "🧛", "👻", "🤖", "👽", "🦄", "🐙", "🦖", "🥷", "🧝"];
