import { Schema, MapSchema, type, ArraySchema } from '@colyseus/schema';
import { ObjType, UserState } from '../../../../globals';

export class Player extends Schema {
	@type('string') public sessionId: string;
	@type('number') public playerNumber: number = -1;
	@type('number') public avatar: number;
	@type('string') public name: string = "Player";
	@type("number") public x: number = 0;
	@type("number") public y: number = 0;
	@type("number") public selectorX: number = 0;
	@type("number") public selectorY: number = 0;
	@type("number") public userState: UserState = UserState.Unready;
	@type("string") public itemOne: string = null;
	@type("string") public itemTwo: string = null;
	@type("number") public speed: number = 0;
	@type("number") public boostTime: number = 0;
	@type("number") public stunTime: number = 0;
	@type("number") public shieldTime: number = 0;
	@type("number") public currentLap: number = 1;
	@type("number") public ranking: number = 1;
	@type("number") public finishTime: number = 0;
	@type("number") public selectedCell: number = -1;
}

export class PlayerData extends Schema {
    @type("string") public name: string;
	@type("string") public sessionId: string;
    @type("number") public avatar: number;
	@type("number") public ranking: number;
    @type("number") public finishTime: number;
}

export class Spawnable extends Schema {
	@type("string") public id: string;
	@type("string") public type: string;
    @type("number") public x: number = 0;
	@type("number") public y: number = 0;
	@type("string") public owner: string;
}

export class TrackPiece extends Schema {
	@type("number") public col: number;
	@type("number") public xPos: number;
	@type("string") public type: ObjType;
	@type("number") public amount: number;
	@type(["number"]) public locations: number[];
}

export class MyRoomState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Spawnable }) spawnables = new MapSchema<Spawnable>();
	@type("number") public gameTime: number = 0;
	@type("number") public timeTillCountdown: number;
	@type("number") public countdownTimer: number;
	@type({ array: TrackPiece }) generatedTrack = new ArraySchema<TrackPiece>();
	@type(["string"]) public playingPlayers: string[] = [];
	@type({ map: PlayerData }) finishedPlayers = new MapSchema<PlayerData>();
	@type("number") themeIndex: number = -1;
	@type("boolean") gameInProgress: boolean = false;
}