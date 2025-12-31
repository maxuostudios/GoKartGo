import { Game, GameObj, Vec2 } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { getStateCallbacks, Room } from "colyseus.js";
import { PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, PLAYGROUND_X, PLAYGROUND_Y, UserState, GAME_HEIGHT, GAME_WIDTH, p, CELL_SIZE, BOOST_MULTIPLIER, ItemType } from "../../../globals";

export default (room: Room<MyRoomState>, player: Player) => ([
    {
        draw() {
            k.drawText({
                text: player.name,
                size: 10,
                pos: k.vec2(-10, -65),
                color: player.sessionId === room.sessionId ? k.GREEN : k.WHITE,
                anchor: "center"
            });
        }
    },
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0, 10), 100, 40) }),
    k.body(),
    k.scale(1),
    k.z(player.y),
    "player",
    {
        sessionId: player.sessionId,
        playerAvatar: player.avatar,
        playerNumber: player.playerNumber,
        netPos: k.vec2(player.x, player.y),
        controllable: false,
        minSpeed: 1000,
        maxSpeed: 1400,
        vx: 0,
        vy: 0,
        skippedIntro: false,
        currentCell: 0,
        isStunned: false,
        isShielded: false,
        playerCharacter: null as GameObj,
        playerCar: null as GameObj,

        add(this: GameObj) {
            this.graphics();

            room.send("changeSpeed", this.minSpeed);

            k.setCamPos(player.x + 2000, k.getCamPos().y);

            const $ = getStateCallbacks(room);

            room.onMessage("raceStart", () => {
                this.controllable = true;
            });

            room.onMessage("raceFinished", () => {
                this.controllable = false;
                this.unuse("body")
                this.unuse("area");
            });

            if (player.sessionId == room.sessionId) this.localCode(room);

            $(player).listen("stunTime", (value) => {
                const wasStunned = this.isStunned;
                this.isStunned = value > 0;

                if (this.isStunned && !wasStunned) {
                    const duration = value;

                    this.playerCharacter.animation.seek(0);
                    this.playerCar.animation.seek(0);

                    this.playerCharacter.animate("scale",
                        [k.vec2(1, 1), k.vec2(-1, 1), k.vec2(1, 1), k.vec2(-1, 1), k.vec2(1, 1)],
                        { duration: duration, loops: 1 }
                    );

                    this.playerCar.animate("scale",
                        [k.vec2(2, 2), k.vec2(-2, 2), k.vec2(2, 2), k.vec2(-2, 2), k.vec2(2, 2)],
                        { duration: duration, loops: 1 }
                    );
                }
                
                if (!this.isStunned && wasStunned) {
                    this.playerCharacter.unanimate("scale");
                    this.playerCharacter.scale = k.vec2(1);
                    this.playerCar.unanimate("scale");
                    this.playerCar.scale = k.vec2(2);
                }
            });
        },

        graphics(this: GameObj) {
            this.playerCharacter = this.add([
                k.sprite("avatar", { frame: this.playerAvatar, width: 75, height: 75 }),
                k.pos(-10, -20),
                k.anchor("center"),
                k.scale(1),
                k.animate()
            ]);

            this.playerCar = this.add([
                k.sprite("bumper_car", { frame: this.playerNumber }),
                k.pos(0, 0),
                k.anchor("center"),
                k.scale(2),
                k.animate()
            ]);
        },

        update(this: GameObj) {
            if (!this.is("localPlayer")) {
                this.pos.x = k.lerp(this.pos.x, player.x, 10 * k.dt());
                this.pos.y = this.z = k.lerp(this.pos.y, player.y, 10 * k.dt());
            }
            else {
                this.z = this.pos.y;
            }
        },

        draw(this: GameObj) {
            if (this.isShielded) {
                k.drawSprite({
                    sprite: "shield",
                    opacity: 0.4,
                    width: 120,
                    height: 100,
                    anchor: "center"
                });
            }
        },

        localCode(this: GameObj, room: Room<MyRoomState>) {
            this.tag("localPlayer");

            this.onUpdate(() => {
                this.isShielded = player.shieldTime > 0;
                this.isStunned = player.stunTime > 0;

                if (!this.isStunned) {
                    this._move();
                    this._item(room);
                }
            });
        },

        _move(this: GameObj) {
            if (!this.skippedIntro) {
                if (k.isKeyDown("enter")) this.skippedIntro = true;
            }

            if (room.state.timeTillCountdown > 0 && !this.skippedIntro) {
                const camPos = k.getCamPos();
                const targetX = player.x + 300;
                const newX = k.lerp(camPos.x, targetX, 1.25 * k.dt());
                k.setCamPos(newX, camPos.y);
            } else {
                this.cameraFollow();
            }

            if (!this.controllable) return;

            // -------------------------
            // Horizontal movement
            // -------------------------
            this.vx = 0;
            //this.vx = player.speed; // auto-move
            //if (k.isKeyDown("a") || k.isKeyDown("left")) this.vx = -player.speed;
            if (k.isKeyDown("d") || k.isKeyDown("right")) this.vx = player.speed;

            // -------------------------
            // Vertical movement
            // -------------------------
            this.vy = 0;
            if (k.isKeyDown("w") || k.isKeyDown("up")) this.vy = -player.speed;
            if (k.isKeyDown("s") || k.isKeyDown("down")) this.vy = player.speed;

            // -------------------------
            // Boost
            // -------------------------
            if (player.boostTime > 0) {
                if (this.vx === 0) this.vx = player.speed;
                this.vx *= BOOST_MULTIPLIER;
            }

            // -------------------------
            // Intended movement
            // -------------------------
            let dx = this.vx * k.dt();
            let dy = this.vy * k.dt();

            // -------------------------
            // Intended new position
            // -------------------------
            let newX = this.pos.x + dx;
            let newY = this.pos.y + dy;

            const RADIUS = 40;
            newY = k.clamp(
                newY,
                PLAYGROUND_Y - PLAYGROUND_HEIGHT,
                GAME_HEIGHT - (RADIUS / 2) - 10
            );

            this.pos.x = newX;
            this.pos.y = newY;

            // -------------------------
            // SEND ONLY
            // -------------------------
            room.send("move", { pos: { x: newX, y: newY } });
        },

        _item(room: Room) {
            if (!this.controllable) return;

            if (player.itemOne && k.isKeyPressed("1")) {
                room.send("useItem", { itemType: player.itemOne, itemBoxIndex: 1 });
            }
            if (player.itemTwo && k.isKeyPressed("2")) {
                room.send("useItem", { itemType: player.itemTwo, itemBoxIndex: 2 });
            }
        },

        cameraFollow() {
            const camPos = k.getCamPos();
            const targetX = player.x + 400;
            const newX = k.lerp(camPos.x, targetX, 5 * k.dt());
            k.setCamPos(newX, camPos.y);
        }
    },
]);