import { Room } from "colyseus.js";
import type { GameObj } from "kaplay";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { setCurrentTrack } from "../localUtils";

const WINNING_SCORE = 1;

export default (room: Room<MyRoomState>) => [
    {
        draw(this: GameObj) {
            if (this.opacity == 0) return;

            k.drawRect({
                anchor: "center",
                pos: k.vec2(0, 0),
                width: 100,
                height: 100,
                radius: [16, 16, 16, 16],
                color: k.Color.fromHex("1f102a"),
                opacity: 0.8,
            });
        },
    },
    k.anchor("center"),
    k.pos(k.width() / 2, k.height() / 2),
    k.fixed(),
    k.z(9999),
    k.text(room.state.countdownTimer.toString(), { size: 50 }),
    k.animate(),
    k.opacity(0),
    {
        add(this: GameObj) {
            room.onMessage("countdown", () => {
                this.text = room.state.countdownTimer;

                this.opacity = 1;

                this.animation.seek(0);
                this.animate("scale", [
                    k.vec2(1),
                    k.vec2(0.75, 1.05),
                    k.vec2(1.2),
                    k.vec2(1),
                ], {
                    duration: 0.2,
                    loops: 1,
                });

                k.play("countdown");
            });

            room.onMessage("raceStart", () => {
                this.text = "Go!";

                this.animation.seek(0);
                this.animate("scale", [
                    k.vec2(1),
                    k.vec2(1.2)
                ], {
                    duration: 0.2,
                    loops: 1,
                });

                k.wait(0.5, () => {
                    this.animation.seek(0);
                    this.animate("scale", [
                        k.vec2(1.2),
                        k.vec2(0),
                    ], {
                        duration: 0.1,
                        loops: 1,
                    });
                });

                const raceStartSound = k.play("race_start");

                raceStartSound.onEnd(() => {
                    setCurrentTrack(k.play("game_track", {
                        loop: true,
                        volume: 0.8
                    }));
                });
            });
        },
    },
];