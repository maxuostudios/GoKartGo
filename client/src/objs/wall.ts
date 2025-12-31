import type { GameObj, Vec2 } from "kaplay";
import { k } from "../App";
import { Room } from "colyseus.js";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { setOffscreenChecks } from "../localUtils";

export default (room: Room<MyRoomState>, pos: Vec2 = k.vec2(0, 0)) => [
    k.sprite("obstacle", { width: 100, height: 100 }),
    k.pos(pos.x, pos.y),
    k.anchor("center"),
    k.area(),
    k.body({ isStatic: true }),
    k.offscreen({ hide: true, pause: true, unpause: true }),
    "wall",
    {
        add(this: GameObj) {
            setOffscreenChecks(this);
        }
    }
]