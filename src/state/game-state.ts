export enum PHASE {
    NAME_ENTRY = "NAME_ENTRY",
    CONFIRMATION = "CONFIRMATION",
}

export type Player = {
    readonly id: string;
    readonly name: string;
    readonly emoji: string;
    readonly x: number;
    readonly y: number;
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
};
