export enum PHASE {
    NAME_ENTRY = "NAME_ENTRY",
    CONFIRMATION = "CONFIRMATION",
    PRE_GAME_COUNTDOWN = "PRE_GAME_COUNTDOWN",
    ROUND = "ROUND",
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
};

export type BoardConfig = {
    readonly width: number;
    readonly height: number;
};

export type GameState = {
    readonly phase: PHASE;
    readonly players: readonly Player[];
    readonly turnIndex: number;
    readonly boardConfig: BoardConfig;
    readonly countdownTimer: number;
    readonly transitionProgress: number; // 0.0 to 1.0, 1.0 means no transition
    readonly oldPhase: PHASE | null;
};
