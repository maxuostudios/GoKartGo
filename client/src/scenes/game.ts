import { k } from "../App";
import { CELL_COUNT, UserState } from "../../../globals";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import playground from "../objs/playground";
import player from "../objs/player";
import { GameObj } from "kaplay";
import itemBoxDisplay from "../objs/itemBoxDisplay";
import positionText from "../objs/positionText";
import minimap from "../objs/minimap";
import countdown from "../objs/countdown";
import endscreen from "../objs/endscreen";
import { createSpawnable } from "../managers/itemManager";
import { previousScene, sessionVisuals, spawnableVisuals } from "../globalListener";
import checkpointBanner from "../objs/checkpointBanner";
import incomingWarning from "../objs/incomingWarning";

let onAddFinishedPlayers: any;
let onAddSpawnables: any;
let onRemoveSpawnables: any;

export function createGameScene() {
    k.scene("game", (room: Room<MyRoomState>) => {
        const $ = getStateCallbacks(room);

        onAddFinishedPlayers = $(room.state).finishedPlayers.onAdd(async (player) => {
            k.get("endscreen")[0].finishedPlayerDisplay(player);
        });

        onAddSpawnables = $(room.state).spawnables.onAdd((spawnable) => {
            spawnableVisuals[spawnable.id] = createSpawnable(room, spawnable);
        });

        onRemoveSpawnables = $(room.state).spawnables.onRemove(async (spawnable) => {
            k.destroy(spawnableVisuals[spawnable.id]);
            delete spawnableVisuals[spawnable.id];
        });

        // necessary?
        const abc = k.onSceneLeave(() => {
            if (previousScene === "game") {
                disposeListeners();
            }

            abc.cancel();
        });

        createGame(room, sessionVisuals[room.sessionId]);
    });
}

export function disposeListeners() {
    onAddFinishedPlayers();
    onAddSpawnables();
    onRemoveSpawnables();
}

async function createGame(room: Room<MyRoomState>, playerSessionVisuals: Record<string, GameObj>) {
    k.add(playground(room));
    k.add(itemBoxDisplay(room));
    k.add(minimap(room));
    k.add(positionText(room));
    k.add(checkpointBanner(room));
    k.add(incomingWarning(room));
    k.add(countdown(room));
    k.add(endscreen(room));

    const playingPlayers = Array.from(room.state.players.values());
    const playingPlayersCount = playingPlayers.length;

    for (let i = 0; i < playingPlayersCount; i++) {
        const player = playingPlayers[i];

        playerSessionVisuals.player = await createPlayer(room, player);
    }
}

async function createPlayer(room: Room<MyRoomState>, playerState: Player) {
    return k.add(player(room, playerState));
}