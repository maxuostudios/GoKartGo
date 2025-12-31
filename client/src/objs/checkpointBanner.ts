import { Room } from "colyseus.js";
import type { GameObj } from "kaplay";
import type { PlayerData, MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { GAME_HEIGHT, GAME_WIDTH, UserState } from "../../../globals";
import { getRankingName } from "../../../utils";
import { sessionVisuals, setPreviousScene } from "../globalListener";
import { currentTrack, setCurrentTrack } from "../localUtils";

const w = GAME_WIDTH / 2;
const h = (GAME_HEIGHT / 2) + 180;

export default (room: Room<MyRoomState>) => [
    k.anchor("center"),
    k.pos(k.center().x, -50),
    k.z(9999),
    k.fixed(),
    k.animate(),
    {
        add(this: GameObj) {
            room.onMessage("checkpointReached", () => {
                this.animation.seek(0);
                this.animate("pos", [
                    k.vec2(k.center().x, -50),
                    k.vec2(k.center().x, 90)
                ], {
                    duration: 0.5,
                    loops: 1,
                });

                k.wait(2.5, () => {
                    this.animation.seek(0);
                    this.animate("pos", [
                        k.vec2(k.center().x, 90),
                        k.vec2(k.center().x, -50)
                    ], {
                        duration: 0.5,
                        loops: 1,
                    });
                });
            });
        },

        draw(this: GameObj) {
            if (this.opacity === 0) return;

            k.drawRect({
                width: w - 150,
                height: 40,
                radius: 10,
                color: k.BLACK,
                opacity: 0.7,
                anchor: "center"
            });

            k.drawSprite({
                sprite: "flag",
                scale: k.vec2(0.05),
                pos: k.vec2(-130, 0),
                anchor: "center",
            });

            k.drawText({
                text: "Checkpoint reached",
                size: 17,
                color: k.WHITE,
                pos: k.vec2(20, 0),
                anchor: "center",
            });
        },
    },
];