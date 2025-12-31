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
    k.rect(w, h, { radius: 10, fill: false }),
    k.anchor("center"),
    k.pos(k.width() / 2, k.height() / 2 + 40),
    k.z(9999),
    k.fixed(),
    k.animate(),
    k.opacity(0),
    "endscreen",
    {
        player: room.state.players.get(room.sessionId),
        canDisplay: false,

        add(this: GameObj) {
            room.onMessage("raceFinished", () => {
                this.canDisplay = true;
                currentTrack.stop();
                setCurrentTrack(k.play("endscreen_track", { volume: 0.2, loop: true }));
            });
        },

        update(this: GameObj) {
            if (!this.canDisplay) return;

            this.opacity = 1;
            this.animation.seek(0);
            this.animate("scale", [
                k.vec2(1),
                k.vec2(1.1, 1.2),
                k.vec2(1),
            ], {
                duration: 0.5,
                loops: 1,
            });

            const backToLobbyBtn = this.add([
                k.rect(140, 40, { radius: 10 }),
                k.color(k.rgb(69, 112, 255)),
                k.outline(2, k.rgb(9, 74, 136)),
                k.area(),
                k.anchor("center"),
                k.pos(0, 190),
                k.z(10000),
                {
                    draw() {
                        k.drawText({
                            text: "Back to Lobby",
                            size: 13,
                            anchor: "center"
                        })
                    }
                }
            ]);

            backToLobbyBtn.onClick(() => {
                setPreviousScene("game");
                currentTrack.stop();
                room.send("returnedToLobby");
                k.go("lobby", room);
            });

            this.canDisplay = false;
        },

        draw(this: GameObj) {
            if (this.opacity === 0) return;

            const bg = k.drawRect({
                width: w,
                height: h,
                radius: 10,
                color: k.BLACK,
                opacity: 0.8,
                anchor: "center"
            });

            const ranking = k.drawText({
                text: getRankingName(this.player.ranking) + " place",
                size: 40,
                color: k.WHITE,
                pos: k.vec2(0, -190),
                anchor: "center",
            });
        },

        finishedPlayerDisplay(this: GameObj, player: PlayerData) {
            const isClient = player.sessionId === room.sessionId;

            const rectWidth = 270;
            const rectHeight = 40;
            const gap = 12;
            const startX = 0;
            const startY = -120;
            const xOffset = 27;

            const x = startX;
            const y = startY + (player.ranking - 1) * (rectHeight + gap);

            const rankingObj = this.add([
                k.pos(x, y),
                k.anchor("center"),
                k.animate(),
                k.z(10000),
                {
                    add(this: GameObj) {
                        this.animation.seek(0);
                        this.animate("scale", [
                            k.vec2(0),
                            k.vec2(1.1, 1.2),
                            k.vec2(1),
                        ], {
                            duration: 0.5,
                            loops: 1,
                        });
                    },
                    draw(this: GameObj) {
                        if (this.parent.opacity === 0) return;

                        const rankingBg = k.drawRect({
                            width: rectHeight,
                            height: rectHeight,
                            pos: k.vec2(-163 + xOffset, 0),
                            color: isClient ? k.rgb(80, 80, 80) : k.rgb(34, 34, 34),
                            outline: { width: 2, color: k.rgb(44, 44, 44) },
                            radius: 10,
                            anchor: "center"
                        });

                        const rankingNum = k.drawText({
                            text: player.ranking.toString(),
                            size: 15,
                            color: k.WHITE,
                            pos: k.vec2(-163 + xOffset, 0),
                            anchor: "center",
                        });

                        const playerBg = k.drawRect({
                            width: rectWidth,
                            height: rectHeight,
                            pos: k.vec2(xOffset, 0),
                            color: isClient ? k.rgb(80, 80, 80) : k.rgb(34, 34, 34),
                            outline: { width: 2, color: k.rgb(44, 44, 44) },
                            radius: 10,
                            anchor: "center"
                        });

                        const playerHead = k.drawSprite({
                            sprite: "head",
                            frame: player.avatar,
                            width: 40,
                            height: 40,
                            anchor: "center",
                            pos: k.vec2(-110 + xOffset, 0)
                        })

                        const playerName = k.drawText({
                            text: player.name,
                            size: 15,
                            color: k.WHITE,
                            pos: k.vec2(-40 + xOffset, 0),
                            anchor: "center",
                        })

                        const finishedTime = k.drawText({
                            text: player.finishTime.toFixed(2),
                            size: 15,
                            color: k.WHITE,
                            pos: k.vec2(90 + xOffset, 0),
                            anchor: "center",
                        })
                    }
                }
            ]);
        }
    },
];