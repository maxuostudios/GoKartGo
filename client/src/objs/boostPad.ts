import type { GameObj, Vec2 } from "kaplay";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";
import { setOffscreenChecks } from "../localUtils";

export default (room: Room<MyRoomState>, pos: Vec2) => [
    k.sprite("boost_pad_base", { width: 90, height: 90 }),
    k.pos(pos),
    k.anchor("center"),
    k.area(),
    k.offscreen({ hide: true, pause: true, unpause: true }),
    "boostPad",
    {
        curX: 0,
        minRainbowSpeed: 40,
        maxRainbowSpeed: 200,
        rainbowSpeed: 0,
        rainbowToken: 0,
        spriteWidth: k.getSprite("boost_arrows").data.width,

        add(this: GameObj) {
            setOffscreenChecks(this);
            
            this.x1 = 0;
            this.x2 = -this.spriteWidth;
            this.rainbowSpeed = this.minRainbowSpeed;

            this.onCollide("player", (player: GameObj) => {
                const token = ++this.rainbowToken;

                this.rainbowSpeed = this.maxRainbowSpeed;

                k.wait(1.5, () => {
                    if (token === this.rainbowToken) {
                        this.rainbowSpeed = this.minRainbowSpeed;
                    }
                });

                if (!player.is("localPlayer")) return;

                room.send("boost", 0.4);
            });
        },

        update(this: GameObj) {
            this.x1 += this.rainbowSpeed * k.dt();
            this.x2 += this.rainbowSpeed * k.dt();

            this.x1 = this.spriteCalc(this.x1);
            this.x2 = this.spriteCalc(this.x2);
        },

        draw(this: GameObj) {
            k.drawSprite({
                sprite: "boost_arrows",
                pos: k.vec2(0, 0),
                anchor: "center"
            });

            k.drawMasked(
                () => {
                    k.drawSprite({
                        sprite: "rainbow",
                        pos: k.vec2(this.x1, 0),
                        anchor: "center"
                    });

                    k.drawSprite({
                        sprite: "rainbow",
                        pos: k.vec2(this.x2, 0),
                        anchor: "center"
                    });
                },
                () => {
                    k.drawSprite({
                        sprite: "boost_arrows",
                        pos: k.vec2(0, 0),
                        anchor: "center"
                    });
                }
            );
        },

        spriteCalc(x: number) {
            if (x >= this.spriteWidth) {
                return -this.spriteWidth;
            }
            return x;
        }
    }
];