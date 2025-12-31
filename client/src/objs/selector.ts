import type { GameObj, Vec2 } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";
import { UserState } from "../../../globals";

export default (room: Room<MyRoomState>, player: Player) => ([
    k.sprite("pointer", { frame: player.playerNumber }),
    k.pos(player.selectorX, player.selectorY),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(-24, -33), 5) }),
    k.scale(0),
    k.z(player.selectorY + 1000),
    "selector",
    {
        // Define a bunch of useful properties
        sessionId: player.sessionId,
        startPos: k.vec2(player.selectorX, player.selectorY),
        moveLerp: 12, // for position interpolation
        overshootLerp: 30, // for fast movement interpolation
        controllable: true, // e.g. disable when resetting player on goal

        hoveredCell: null as GameObj,
        hasSelected: false,

        add(this: GameObj) {
            // Scale player in with nice transition once added
            k.tween(this.scale, k.vec2(1.2), 0.25, v => this.scale = v, k.easings.easeOutBack);

            if (player.sessionId == room.sessionId) this.onLocalSelectorCreated(room, player, this);

            // why?
            /*room.onMessage("playerLeft", () => {
                console.log("ksks", player.playerNumber);
                this.frame = player.playerNumber;
            })*/
        },

        update(this: GameObj) {
            this.frame = player.playerNumber;
            
            /*if (player.userState === UserState.Playing
                || player.userState === UserState.Finished
            ) {
                this.hidden = true;
                this.controllable = false;
                return;
            }
            else {
                this.hidden = false;
                this.controllable = true;
            }*/

            this.pos.x = k.lerp(
                this.pos.x,
                player.selectorX,
                k.dt() * this.moveLerp
            );
            this.pos.y = this.z = k.lerp(
                this.pos.y,
                player.selectorY,
                k.dt() * this.moveLerp
            );
        },

        onLocalSelectorCreated(room: Room<MyRoomState>, player: Player, selectorObj: GameObj) {
            selectorObj.tag("localSelector");

            let pos = selectorObj.startPos;

            // Movement speed per second
            const speed = 850;

            selectorObj.onKeyPress("enter", () => { this.selectOrDeselect() });
            selectorObj.onKeyPress("space", () => { this.selectOrDeselect() });

            selectorObj.onUpdate(() => {
                let dx = 0;
                let dy = 0;

                // Horizontal
                if (k.isKeyDown("a") || k.isKeyDown("left")) dx -= 1;
                if (k.isKeyDown("d") || k.isKeyDown("right")) dx += 1;

                // Vertical
                if (k.isKeyDown("w") || k.isKeyDown("up")) dy -= 1;
                if (k.isKeyDown("s") || k.isKeyDown("down")) dy += 1;

                if (!this.hasSelected) {
                    let newHovered: GameObj = null;

                    const allCells = k.get("cell");
                    allCells.forEach((cell: GameObj) => {
                        if (selectorObj.isOverlapping(cell)) {
                            newHovered = cell;
                        }
                        cell.hovering = false;
                    });

                    // mark the hovered cell
                    if (newHovered) {
                        newHovered.hovering = true;
                        selectorObj.hoveredCell = newHovered;
                        room.send("hoverCell", this.hoveredCell.avatar);
                    } else {
                        selectorObj.hoveredCell = null;
                        room.send("hoverCell", 0);
                    }
                }

                // No input → no movement
                if (dx === 0 && dy === 0) return;

                // Normalize diagonal movement
                const dir = k.vec2(dx, dy).unit();

                // Apply delta movement
                const newX = pos.x + dir.x * speed * k.dt();
                const newY = pos.y + dir.y * speed * k.dt();

                // Pos
                pos = k.vec2(newX, newY);

                // Send to server
                room.send("selectorMove", pos);
            });
        },

        selectOrDeselect() {
            /*if (player.userState !== UserState.Unready &&
                player.userState !== UserState.Ready
            ) return;*/

            if (this.hoveredCell) {
                if (this.hoveredCell.playerIndex > -1) {
                    this.deselectCell();
                }
                else {
                    this.selectCell();
                }
            }
        },

        selectCell() {
            room.send("selectCell", this.hoveredCell.cellId);
            this.hasSelected = true;
        },

        deselectCell() {
            if (!this.hoveredCell || !this.hoveredCell.cellId) return;

            room.send("deselectCell", this.hoveredCell.cellId);
            this.hasSelected = false;
        }
    },
]);

/*function updatePointer(room: Room<MyRoomState>, player: Player) {
    const players = Array.from(room.state.players.values());
    console.log(players)
    const pp = players.findIndex(p => p.sessionId === player.sessionId);
    return pp;
}*/