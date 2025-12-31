import { GameObj } from "kaplay";
import { k } from "./App"
import { MyRoomState } from "../../server/src/rooms/schema/MyRoomState";
import { getStateCallbacks, Room } from "colyseus.js";
import { createSelector } from "./scenes/lobby";

type SessionVisuals = {
    selector: GameObj,
    player: GameObj
}

export const sessionVisuals: Record<string, SessionVisuals> = {};
export const spawnableVisuals: Record<string, GameObj> = {};

/*export let currentRoom = null as Room<MyRoomState>

export function setRoom(room: Room<MyRoomState>) {
    currentRoom = room;
}*/

export let previousScene = null as string;

export function setPreviousScene(name: string) {
    previousScene = name;
}

export function setListeners(room: Room<MyRoomState>) {
    const $ = getStateCallbacks(room);

    $(room.state).players.onAdd(async (player, sessionId) => {
        sessionVisuals[sessionId] = {
            selector: null,
            player: null
        }

        if (k.getSceneName() === "lobby") {
            sessionVisuals[sessionId].selector = await createSelector(room, player);
        }

        k.get("cell").forEach(cell => cell.updateCellData());

        $(player).listen("selectedCell", () => {
            k.get("cell").forEach(cell => cell.updateCellData());
        });

        if (sessionVisuals[sessionId].selector) {
            sessionVisuals[sessionId].selector.deselectCell();
        }
    });

    $(room.state).players.onRemove((player, sessionId) => {
        const sv = sessionVisuals[sessionId];

        if (sv.selector && sv.selector.exists()) k.destroy(sv.selector);

        delete sessionVisuals[sessionId];

        Object.values(sessionVisuals).forEach((ses, i) => {
            if (ses?.selector?.hoveredCell) {
                ses.selector.deselectCell();
            }
        });

        k.get("cell").forEach(cell => cell.updateCellData());
    });

    room.onMessage("gameSceneEnter", () => {
        setPreviousScene("sceneSelect");
        k.go("game", room);
        k.play("race_intro");
    });
}