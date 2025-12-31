import { k } from "../App";
import { cellW, cellH } from "../../../globals";

import { Room } from "colyseus.js";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { GameObj } from "kaplay";

export function createSceneSelectScene() {
    k.scene("sceneSelect", (room: Room<MyRoomState>) => {
        let moveIndex = 0;
        let maxThemes = 3;

        displayLobbyBackground();
        createHorizontalGroup();

        const randomiseLoop = k.loop(0.1, () => {
            if (moveIndex < 2) moveIndex++;
            else moveIndex = 0;
        });

        room.onMessage("randomiseComplete", () => {
            randomiseLoop.cancel();

            moveIndex = room.state.themeIndex;
            const themeOption = k.get("themeOption")[moveIndex];

            themeOption.z = 10;

            k.tween(themeOption.scale, k.vec2(1.1), 0.25, v => themeOption.scale = v, k.easings.easeOutBack);
        });

        function displayLobbyBackground() {
            k.onDraw(() => {
                k.drawSprite({
                    sprite: "blue_bg"
                });

                k.drawText({
                    text: "Selecting scene",
                    pos: k.vec2(k.center().x, 80),
                    anchor: "top"
                })
            });
        }

        function createHorizontalGroup() {
            const rows = 1;
            const cols = maxThemes;
            const gap = 100;
            const offsetStartY = 0;

            const totalW = cols * cellW + (cols - 1) * gap;
            const totalH = rows * cellH;

            const startX = (k.width() - totalW) / 2;
            const startY = (k.height() - totalH) / 2 + offsetStartY;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = startX + c * (cellW + gap) + cellW / 2;
                    const y = startY + r * (cellH + gap) + cellH / 2;

                    const frame = r * cols + c;
                    createThemeOption(x, y, frame);
                }
            }
        }

        function createThemeOption(x: number, y: number, frame: number) {
            k.add([
                k.rect(210, 200, { radius: 5 }),
                k.pos(x, y),
                k.outline(3, k.BLACK),
                k.color(k.rgb(128, 128, 128)),
                k.scale(1),
                k.anchor("center"),
                k.z(0),
                "themeOption",
                {
                    add(this: GameObj) {
                        k.tween(this.scale, k.vec2(0.8), 0.25, v => this.scale = v, k.easings.easeOutBack);
                    },

                    draw(this: GameObj) {
                        const rectWidth = 210;
                        const rectHeight = 200;
                        const bgHeight = 60;
                        const tileSize = 50;

                        const bgPosY = -rectHeight / 2 + bgHeight / 2;

                        k.drawSprite({
                            sprite: "bg_tile",
                            frame: frame,
                            width: rectWidth,
                            height: bgHeight,
                            tiled: true,
                            pos: k.vec2(0, bgPosY),
                            anchor: "center"
                        });

                        const floorMaskHeight = rectHeight - bgHeight;
                        const floorMaskPosY = bgPosY + bgHeight / 2 + floorMaskHeight / 2;

                        k.drawMasked(
                            () => {
                                const cols = Math.ceil(rectWidth / tileSize);
                                const rows = Math.ceil(floorMaskHeight / tileSize);

                                for (let cx = 0; cx < cols; cx++) {
                                    for (let cy = 0; cy < rows; cy++) {
                                        k.drawSprite({
                                            sprite: "floor",
                                            frame: frame,
                                            width: tileSize,
                                            height: tileSize,
                                            anchor: "topleft",
                                            pos: k.vec2(
                                                -rectWidth / 2 + cx * tileSize,
                                                floorMaskPosY - floorMaskHeight / 2 + cy * tileSize
                                            )
                                        });
                                    }
                                }
                            },
                            () => {
                                k.drawRect({
                                    width: rectWidth,
                                    height: floorMaskHeight,
                                    pos: k.vec2(0, floorMaskPosY),
                                    anchor: "center"
                                });
                            }
                        );

                        if (frame === moveIndex) {
                            k.drawRect({
                                width: 210,
                                height: 200,
                                fill: false,
                                outline: { width: 7, color: k.WHITE },
                                anchor: "center"
                            });
                        }
                    }
                }
            ]);

        }
    });
}
