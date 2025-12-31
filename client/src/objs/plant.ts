import type { GameObj, Vec2 } from "kaplay";
import { k } from "../App";
import { Room } from "colyseus.js";
import type { MyRoomState, Player, Spawnable } from "../../../server/src/rooms/schema/MyRoomState";
import { setOffscreenChecks } from "../localUtils";

export default (room: Room<MyRoomState>, spawnable: Spawnable) => [
    k.sprite("plant", { width: 80, height: 80 }),
    k.pos(spawnable.x, spawnable.y - 12),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(0, 7), 35) }),
    k.offscreen({ hide: true, pause: true, unpause: true }),
    "plant",
    {
        spawnableId: spawnable.id,

        add(this: GameObj) {
            setOffscreenChecks(this);

            this.onCollide("player", (player: GameObj) => {
                if (player.sessionId === spawnable.owner) return;

                room.send("hitPlayer", {
                    targetId: player.sessionId,
                    duration: 1
                });

                room.send("objectDestroyed", this.spawnableId);
            })
        }
    }
]