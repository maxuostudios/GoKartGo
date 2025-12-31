import type { GameObj, Vec2 } from "kaplay";
import { k } from "../App";
import { setOffscreenChecks } from "../localUtils";
import { Room } from "colyseus.js";
import { MyRoomState, Spawnable } from "../../../server/src/rooms/schema/MyRoomState";

export default (room: Room<MyRoomState>, spawnable: Spawnable) => [
    k.sprite("homing_bullet"),
    k.scale(0.8),
    k.pos(spawnable.x, spawnable.y),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(0), 30) }),
    k.z(500),
    k.offscreen({ hide: true }),
    "homing_bullet",
    {
        spawnableId: spawnable.id,

        dir: k.vec2(1, 0),
        targetSessionId: null as string,

        speed: 1700,
        turnRate: 15,
        minTargetDistance: 80,

        hasDetonated: false,

        add(this: GameObj) {
            k.wait(10, () => room.send("objectDestroyed", this.spawnableId));

            setOffscreenChecks(this);


            // ─────────────────────────────
            // COLLISIONS
            // ─────────────────────────────
            this.onCollide("plant", (plant: GameObj) => {
                room.send("objectDestroyed", plant.spawnableId);
                room.send("objectDestroyed", this.spawnableId);
            });

            // ─────────────────────────────
            // IDENTIFY TARGET
            // ─────────────────────────────
            let bestDist = Infinity;
            const forward = this.dir.unit();

            room.state.players.forEach((p) => {
                if (p.sessionId === spawnable.owner) return;

                const toPlayer = k.vec2(p.x - this.pos.x, p.y - this.pos.y);
                const dist = toPlayer.len();

                if (dist < this.minTargetDistance) return;

                if (forward.dot(toPlayer.unit()) <= 0) return;

                if (dist < bestDist) {
                    bestDist = dist;
                    this.targetSessionId = p.sessionId;
                }
            });
        },

        update(this: GameObj) {
            if (this.targetSessionId && !this.hasDetonated) {
                const target = room.state.players.get(this.targetSessionId);
                if (target) {
                    const toTarget = k.vec2(target.x - this.pos.x, target.y - this.pos.y);
                    const dist = toTarget.len();

                    if (dist < 50) {
                        room.send("hitPlayer", {
                            targetId: this.targetSessionId,
                            duration: 0.5,
                        });
                        room.send("objectDestroyed", this.spawnableId);
                        this.hasDetonated = true;
                        return;
                    }

                    const desiredDir = toTarget.unit();
                    this.dir = this.dir.lerp(desiredDir, this.turnRate * k.dt()).unit();
                } else {
                    this.targetSessionId = null;
                }
            }

            this.move(this.dir.scale(this.speed));
        }
    }
];