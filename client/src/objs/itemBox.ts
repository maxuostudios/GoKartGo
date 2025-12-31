import type { GameObj, Vec2 } from "kaplay";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";
import { randomItem } from "../../../utils";
import { setOffscreenChecks } from "../localUtils";
import { ItemType } from "../../../globals";

export default (room: Room<MyRoomState>, pos: Vec2) => [
    k.sprite("item_box", { width: 40, height: 40 }),
    k.scale(3),
    k.pos(pos),
    k.anchor("center"),
    k.area(),
    k.offscreen({ hide: true, pause: true, unpause: true }),
    "itemBox",
    {
        maxScale: 3.4,

        add(this: GameObj) {
            setOffscreenChecks(this);

            this.onCollide("player", (player: GameObj) => {
                const baseScale = this.scale.clone()

                k.tween(
                    baseScale,
                    k.vec2(this.maxScale),
                    0.1,
                    v => this.scale = v.clone(),
                    k.easings.easeOutBack
                )

                k.tween(
                    1,
                    0,
                    0.1,
                    v => this.opacity = v,
                    k.easings.easeInOutBounce
                ).then(() => {
                    k.wait(0.5, () => {
                        k.tween(
                            this.scale, k.vec2(this.maxScale + 0.2), 0.25, v => this.scale = v, k.easings.easeOutBack
                        ).then(() => {
                            k.tween(
                                this.scale, k.vec2(3), 0.25, v => this.scale = v, k.easings.easeOutBack
                            )
                        });
    
                        k.tween(
                            0,
                            1,
                            0.1,
                            v => this.opacity = v,
                            k.easings.easeInOutBounce
                        )
                    });
                });

                if (!player.is("localPlayer")) return;

                room.send("addItem");
            });
        }
    }
];