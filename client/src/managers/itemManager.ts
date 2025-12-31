import { Room } from "colyseus.js";
import type { MyRoomState, Spawnable } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import bullet from "../objs/bullet";
import homingBullet from "../objs/homingBullet";
import plant from "../objs/plant";
import { sessionVisuals } from "../globalListener";

export function createSpawnable(room: Room<MyRoomState>, spawnable: Spawnable) {
    switch (spawnable.type) {
        case "bullet":
            return k.add(bullet(room, spawnable));
        case "homing_bullet":
            return k.add(homingBullet(room, spawnable));
        case "plant":
            return k.add(plant(room, spawnable));
        default:
            break;
    }
}