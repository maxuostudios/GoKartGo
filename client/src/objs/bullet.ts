import type { GameObj, Vec2 } from "kaplay";
import { k } from "../App";
import { setOffscreenChecks } from "../localUtils";
import { Room } from "colyseus.js";
import { MyRoomState, Spawnable } from "../../../server/src/rooms/schema/MyRoomState";

export default (room: Room<MyRoomState>, spawnable: Spawnable) => [
    k.sprite("bullet"),
    k.scale(0.8),
    k.pos(spawnable.x, spawnable.y),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(0), 30) }),
    k.z(500),
    k.move(k.vec2(1, 0), 2000),
    k.offscreen({ hide: true }),
    "bullet",
    {
        spawnableId: spawnable.id,
        hasDetonated: false,

        add(this: GameObj) {
            k.wait(10, () => room.send("objectDestroyed", this.spawnableId));

            setOffscreenChecks(this);

            /*this.onCollide("player", (player: GameObj) => {
                if (spawnable.owner !== room.sessionId) return;
                if (player.sessionId === spawnable.owner) return;

                room.send("hitPlayer", {
                    targetId: player.sessionId,
                    duration: 0.5,
                });
                
                room.send("objectDestroyed", this.spawnableId);
                this.destroy();  // Local cleanup for prediction
            })*/

            this.onCollide("plant", (plant: GameObj) => {
                room.send("objectDestroyed", plant.spawnableId);
                room.send("objectDestroyed", this.spawnableId);
                //this.destroy();  // Local cleanup
            })
        },

        update(this: GameObj) {
            if (spawnable.owner !== room.sessionId || this.hasDetonated) return;

            let closestDist = Infinity;
            let closestTargetId: string | null = null;

            room.state.players.forEach((p) => {
                if (p.sessionId === spawnable.owner) return;

                const toPlayer = k.vec2(p.x - this.pos.x, p.y - this.pos.y);
                const dist = toPlayer.len();

                if (dist < closestDist) {
                    closestDist = dist;
                    closestTargetId = p.sessionId;
                }
            });

            if (closestDist < 50 && closestTargetId) {
                room.send("hitPlayer", {
                    targetId: closestTargetId,
                    duration: 0.5,
                });
                room.send("objectDestroyed", this.spawnableId);
                this.hasDetonated = true;
            }
        }
    }
];