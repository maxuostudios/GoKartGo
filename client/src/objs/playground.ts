import { Circle, type GameObj } from "kaplay";
import { k } from "../App";
import { Room } from "colyseus.js";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { CELL_COUNT, CELL_SIZE, GAME_HEIGHT, GAME_WIDTH, ObjType, PLAYGROUND_HEIGHT, PLAYGROUND_ROWS, PLAYGROUND_WIDTH, PLAYGROUND_X, PLAYGROUND_Y, lapPos, p } from "../../../globals";
import itemBox from "./itemBox";
import boostPad from "./boostPad";
import wall from "./wall";

const yPlacements = [-200, -100, 0, 100, 200];

export default (room: Room<MyRoomState>) => [
    {
        themeIndex: room.state.themeIndex,

        draw() {
    const tileSize = 100;

    const camX = k.getCamPos().x;
    const startX =
        Math.floor((camX - GAME_WIDTH) / tileSize) * tileSize;
    const endX =
        Math.ceil((camX + GAME_WIDTH) / tileSize) * tileSize;

    for (let x = startX; x <= endX; x += tileSize) {
        k.drawSprite({
            sprite: "bg_tile",
            frame: this.themeIndex,
            width: tileSize,
            height: tileSize,
            pos: k.vec2(x, 0),
            anchor: "top",
        });

        for (let y = 0; y < PLAYGROUND_HEIGHT; y += tileSize) {
            k.drawSprite({
                sprite: "floor",
                frame: this.themeIndex,
                width: tileSize,
                height: tileSize,
                pos: k.vec2(x, PLAYGROUND_Y - y),
                anchor: "bot",
            });
        }
    }


            drawLaps();
        }
    },
    {
        add(this: GameObj) {
            this.createObjects();
        },

        createObjects() {
            const generatedTrack = room.state.generatedTrack;

            for (let i = 0; i < generatedTrack.length; i++) {
                const trackPiece = generatedTrack[i];

                switch (trackPiece.type) {
                    case ObjType.Wall: // Wall Area
                        createWalls(trackPiece);
                        break;
                    case ObjType.ItemBox: // Item Boxes
                        createItemBoxes(trackPiece);
                        break;
                    case ObjType.BoostPad: // Boost Pads
                        createBoostPads(trackPiece);
                        break;
                    default:
                        break;
                }

                function createWalls(trackPiece: any) {
                    for (let i = 0; i < trackPiece.amount; i++) {
                        const obj = k.add(wall(room, k.vec2(trackPiece.xPos, p + yPlacements[trackPiece.locations[i]])));
                    }
                }

                function createItemBoxes(trackPiece: any) {
                    for (let i = 0; i < trackPiece.amount; i++) {
                        const obj = k.add(itemBox(room, k.vec2(trackPiece.xPos, p + yPlacements[trackPiece.locations[i]])));
                    }
                }

                function createBoostPads(trackPiece: any) {
                    for (let i = 0; i < trackPiece.amount; i++) {
                        const obj = k.add(boostPad(room, k.vec2(trackPiece.xPos, p + yPlacements[trackPiece.locations[i]])));
                    }
                }
            }
        }
    }
]

function drawLaps() {
    for (let i = 0; i < lapPos.length; i++) {
        k.drawSprite({
            sprite: "checkered",
            width: 100,
            height: PLAYGROUND_HEIGHT,
            anchor: "center",
            pos: k.vec2(lapPos[i], p)
        });
    }
}