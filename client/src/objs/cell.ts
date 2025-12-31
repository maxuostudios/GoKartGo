import type { GameObj, Vec2, Color } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { getColor } from "../../../utils";
import { Room } from "colyseus.js";
import { cellW, cellH, scaleSize } from "../../../globals";

// Needs room state and player instance for server communication and player data
export default (room: Room<MyRoomState>, avatar: number, x: number, y: number, i: number) => ([
    k.rect(cellW, cellH, { radius: 5 }),
    k.pos(k.vec2(x, y)),
    k.color(k.rgb(24, 16, 139)),
    k.outline(5, k.rgb(28, 10, 107)),
    k.anchor("center"),
    k.area(),
    k.z(0),
    "cell",
    {
        hovering: false,
        avatar: avatar,
        cellId: i,
        playerIndex: -1,
        playerColor: null as any,

        add() {
            this.updateCellData();
        },

        draw() {
            k.drawMasked(
                () => {
                    // CONTENT
                    k.drawSprite({
                        sprite: "avatar",
                        frame: avatar,
                        pos: k.vec2(0, 10),
                        width: cellW * scaleSize,
                        height: cellH * scaleSize,
                        anchor: "center"
                    });
                },
                () => {
                    // MASK
                    k.drawRect({
                        pos: k.vec2(0, 0),
                        width: cellW,
                        height: cellH,
                        anchor: "center",
                    });
                }
            );

            if (this.hovering && this.playerIndex === -1) {
                k.drawRect({
                    pos: k.vec2(0, 0),
                    width: cellW,
                    height: cellH,
                    color: k.WHITE,
                    opacity: 0.12,
                    anchor: "center"
                });
            }

            if (this.playerIndex > -1) {
                k.drawRect({
                    pos: k.vec2(0, 0),
                    width: cellW,
                    height: cellH,
                    color: k.BLACK,
                    opacity: 0.5,
                    anchor: "center"
                });

                k.drawRect({
                    pos: k.vec2(0, 0),
                    width: cellW - 10,
                    height: cellH - 10,
                    fill: false,
                    outline: { width: 5, color: this.playerColor },
                    anchor: "center"
                });

                k.drawCircle({
                    pos: k.vec2(-30, 30),
                    radius: 15,
                    color: k.WHITE,
                    outline: { width: 3, color: this.playerColor },
                    anchor: "center"
                });

                k.drawText({
                    pos: k.vec2(-30, 30),
                    text: `P${this.playerIndex + 1}`,
                    size: 15,
                    color: this.playerColor,
                    anchor: "center",
                });
            }
        },

        updateCellData() {
            const players = room.state.players;

            let newIndex = -1;
            let newColor = new k.Color(255, 255, 255);

            for (const player of players.values()) {
                if (player.selectedCell === this.cellId) {
                    newIndex = player.playerNumber;
                    const { r, g, b } = getColor(player.playerNumber);
                    newColor = new k.Color(r, g, b);
                    break;
                }
            }

            this.playerIndex = newIndex;
            this.playerColor = newColor;
        }
    }
]);