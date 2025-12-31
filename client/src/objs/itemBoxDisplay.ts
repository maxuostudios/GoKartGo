import { Room } from "colyseus.js";
import type { GameObj } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";

export default (room: Room<MyRoomState>) => [
    k.anchor("topleft"),
    k.pos(50, 50),
    k.fixed(),
    k.z(9998),
    k.animate(),
    {
        draw() {
            const player = room.state.players.get(room.sessionId);
            
            //------------------------
            // ITEM ONE
            //------------------------

            const itemOneBg = k.drawRect({
                width: 70,
                height: 70,
                color: k.BLACK,
                opacity: 0.5,
                radius: 10,
                pos: k.vec2(0, 0),
                anchor: "center",
            });

            if (player.itemOne) {
                const itemOneSprite = k.drawSprite({
                    sprite: player.itemOne,
                    width: 60,
                    height: 60,
                    pos: k.vec2(0, 0),
                    anchor: "center",
                });
            }

            //------------------------
            // ITEM TWO
            //------------------------

            const itemTwoBg = k.drawRect({
                width: 70,
                height: 70,
                color: k.BLACK,
                opacity: 0.5,
                radius: 10,
                pos: k.vec2(80, 0),
                anchor: "center",
            });

            if (player.itemTwo) {
                const itemTwoSprite = k.drawSprite({
                    sprite: player.itemTwo,
                    width: 60,
                    height: 60,
                    pos: k.vec2(80, 0),
                    anchor: "center",
                });
            }
        }
    },
];