import { Room } from "colyseus.js";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { GAME_HEIGHT, GAME_WIDTH, ItemType, UserState } from "../../../globals";
import { GameObj } from "kaplay";
import { spawnableVisuals } from "../globalListener";

export default (room: Room<MyRoomState>) => [
    k.rect(150, 30, { radius: 5 }),
    k.color(k.BLACK),
    k.anchor("center"),
    k.pos(90, 105),
    k.z(9999),
    k.fixed(),
    k.animate(),
    k.state("red-up", ["red-up", "red-down"]),
    k.opacity(0),
    {
        player: room.state.players.get(room.sessionId),
        incomingSpawnables: [] as any[],

        add(this: GameObj) {
            const speed = 0.7;

            let pulse = 0;

            this.onStateEnter("red-up", async () => {
                await k.tween(
                    pulse,
                    1,
                    speed,
                    (val) => {
                        pulse = val
                        this.color = k.rgb(255 * val, 0, 0)
                    },
                    k.easings.linear
                )
                this.enterState("red-down")
            });

            this.onStateEnter("red-down", async () => {
                await k.tween(
                    pulse,
                    0,
                    speed,
                    (val) => {
                        pulse = val
                        this.color = k.rgb(255 * val, 0, 0)
                    },
                    k.easings.linear
                )
                this.enterState("red-up")
            });

            this.enterState("red-up")
        },

        update(this: GameObj) {
            this.checkBulletsInRange(this);
        },

        checkBulletsInRange(this: GameObj) {
            this.incomingSpawnables = [...room.state.spawnables.values()]
                .filter(s => {
                    return (
                        (s.type === ItemType.Bullet || s.type === ItemType.HomingBullet) &&
                        spawnableVisuals[s.id].pos.x < this.player.x &&
                        (this.player.x - spawnableVisuals[s.id].pos.x) <= 1500 &&
                        s.owner !== this.player.sessionId
                    );
                });

            if (this.incomingSpawnables.length > 0) this.opacity = 1;
            else this.opacity = 0;
        },

        draw(this: GameObj) {
            if (this.opacity === 0 && this.incomingSpawnables.length <= 0) return;

            for (let i = 0; i < this.incomingSpawnables.length; i++) {
                const spawnableSprite = this.incomingSpawnables[i].type;

                k.drawSprite({
                    sprite: spawnableSprite,
                    scale: k.vec2(0.3),
                    pos: k.vec2((-60 + (i * 12)), 0),
                    anchor: "center",
                });
            }

            k.drawText({
                text: "Incoming",
                size: 15,
                color: k.WHITE,
                pos: k.vec2(20, 0),
                anchor: "center",
            });
        }
    },
];