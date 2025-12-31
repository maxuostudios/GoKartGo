import { Room } from "colyseus.js";
import type { GameObj } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { GAME_WIDTH, lapPos, PLAYGROUND_WIDTH, UserState } from "../../../globals";

export default (room: Room<MyRoomState>) => [
    k.pos(GAME_WIDTH / 2, 50),
    k.anchor("top"),
    k.fixed(),
    k.z(9998),
    {
        TRACK_WIDTH: PLAYGROUND_WIDTH,
        MINI_TRACK_WIDTH: 500,

        draw(this: GameObj) {
            k.drawRect({
                width: this.MINI_TRACK_WIDTH,
                height: 30,
                color: k.BLACK,
                opacity: 0.5,
                anchor: "center",
                radius: 10
            });

            this.drawLapFlags();
            this.drawMiniChars();
        },

        drawMiniChars() {
            const playingPlayers = Array.from(room.state.players.values())
                .filter(p => p.userState === UserState.Playing || p.userState === UserState.Finished);

            playingPlayers.forEach(p => {
                k.drawSprite({
                    sprite: "head",
                    frame: p.avatar,
                    width: 40,
                    height: 40,
                    anchor: "center",
                    pos: k.vec2((-this.MINI_TRACK_WIDTH / 2) + this.miniX(p.x), 0)
                })
            });
        },

        drawLapFlags() {
            for (let i = 0; i < lapPos.length; i++) {
                k.drawSprite({
                    sprite: "flag",
                    width: 30,
                    height: 30,
                    anchor: "center",
                    pos: k.vec2((-this.MINI_TRACK_WIDTH / 2) + this.miniX(lapPos[i]), 0)
                })
            }
        },

        miniX(x: number) {
            return k.clamp(
                (x / this.TRACK_WIDTH) * this.MINI_TRACK_WIDTH,
                0,
                this.MINI_TRACK_WIDTH
            );
        }
    },
];