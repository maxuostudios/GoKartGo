import type { GameObj, Vec2 } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";
import { PLAYGROUND_HEIGHT } from "../../../globals";

export default (room: Room<MyRoomState>, startPos: Vec2) => [
    k.sprite("blob", { flipX: true }),
    k.pos(startPos),
    k.anchor("center"),
    k.area({
        shape: new k.Circle(k.vec2(0), 2 / 2),
        collisionIgnore: ["player"]
    }),
    k.body(),
    k.z(500),
    k.scale(0.4),
    k.move(k.vec2(-1, 0), 200),
    "blob",
    {
        add(this: GameObj) {
            console.log(this.pos)
        }
    }
];