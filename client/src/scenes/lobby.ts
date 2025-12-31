import { k } from "../App";
import { MAX_PLAYERS, cellW, cellH, scaleSize, UserState } from "../../../globals";
import { getColor } from "../../../utils";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import cell from "../objs/cell";
import selector from "../objs/selector";
import { AudioPlay, GameObj } from "kaplay";
import { sessionVisuals, setPreviousScene } from "../globalListener";
import { setButtonHover } from "./home";

let lobbyTrack: AudioPlay;

export function createLobbyScene() {
  k.scene("lobby", async (room: Room<MyRoomState>) => {
    lobbyTrack = k.play("lobby_track", { loop: true, volume: 0.3 });

    displayLobbyBackground();

    await rehydrateSelectors(room);

    room.onStateChange.once(async (state) => {
      displayCharacterSelection(room);
    });

    const $ = getStateCallbacks(room);

    room.onMessage("sceneSelectEnter", () => {
      lobbyTrack.stop();
      setPreviousScene("lobby");
      k.go("sceneSelect", room);
    });

    createRoomCodeText(room);
  });
}

async function rehydrateSelectors(room: Room<MyRoomState>) {
  for (const [sessionId, sv] of Object.entries(sessionVisuals)) {
    const player = room.state.players.get(sessionId);
    if (!player) continue;

    sv.selector = await createSelector(room, player);
  }
}

function displayLobbyBackground() {
  k.onDraw(() => {
    k.drawSprite({
      sprite: "lobby_bg"
    });
  });
}

function displayCharacterSelection(room: Room<MyRoomState>) {
  //createLeaveButton(room); // didnt work!?
  createCharacterGrid(room);
  createCountDisplay(room);
  createPlayerDisplay(room);
  createRoomCodeText(room);
}

function createLeaveButton(room: Room<MyRoomState>) {
  const leaveBtnColor = k.rgb(25, 15, 173);

  const leaveBtn = k.add([
    k.rect(40, 40, { radius: 7 }),
    k.pos(40, 40),
    k.anchor("center"),
    k.color(leaveBtnColor),
    k.area(),
    k.outline(3, k.rgb(18, 34, 122)),
    {
      draw() {
        k.drawText({
          text: "<",
          size: 18,
          color: k.WHITE,
          anchor: "center"
        })
      }
    }
  ]);

  setButtonHover({
    btn: leaveBtn,
    originalBgColor: leaveBtnColor,
    hoverBgColor: k.rgb(12, 28, 99)
  });

  /*leaveBtn.onClick(() => {
    room.leave();
    k.go("home");
  });*/
}

function createCharacterGrid(room: Room<MyRoomState>) {
  const rows = 3;
  const cols = 6;
  const offsetStartY = 75;

  const totalW = cols * cellW + (cols - 1);
  const totalH = rows * cellH + (rows - 1);

  const startX = (k.width() - totalW) / 2;
  const startY = ((k.height() - totalH) / 2) + offsetStartY;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;

      const x = startX + c * cellW + cellW / 2; // add half width
      const y = startY + r * cellH + cellH / 2; // add half height

      const avatar = r * cols + c;

      createCell(room, avatar, x, y, i);
    }
  }
}

function createPlayerDisplay(room: Room<MyRoomState>) {
  const overlay = createOverlay();

  const count = MAX_PLAYERS;
  const itemWidth = 120;
  const itemHeight = 120;
  const gap = 20;

  const totalWidth = count * itemWidth + (count - 1) * gap;

  const startX = (k.width() / 2) - (totalWidth / 2);
  const startY = 65;

  for (let i = 0; i < count; i++) {
    const { r, g, b } = getColor(i);

    const x = startX + i * (itemWidth + gap) + itemWidth / 2;
    const y = startY + itemHeight / 2;

    const playerDisplay = k.add([
      k.rect(itemWidth, itemHeight, { radius: 10 }),
      k.pos(k.vec2(x, y)),
      k.color(k.WHITE),
      k.outline(5, new k.Color(r, g, b)),
      k.anchor("center"),
      k.z(0)
    ]);

    playerDisplay.onDraw(() => {
      const player = Array.from(room.state.players.values())[i];

      if (player) {
        k.drawMasked(
          () => {
            // CONTENT
            k.drawSprite({
              sprite: "avatar",
              frame: player.avatar,
              width: itemWidth * scaleSize - 20,
              height: itemHeight * scaleSize - 20,
              pos: k.vec2(0, 10),
              anchor: "center"
            });
          },
          () => {
            // MASK
            k.drawRect({
              pos: k.vec2(0, 0),
              width: itemWidth,
              height: itemHeight,
              anchor: "center",
            });
          }
        );

        k.drawText({
          text: player.name,
          pos: k.vec2(0, 45),
          size: 20,
          anchor: "center"
        });

        k.drawRect({
          width: itemWidth,
          height: 30,
          pos: k.vec2(0, -80),
          color: new k.Color(r, g, b),
          outline: { width: 2, color: k.rgb(255, 255, 255) },
          radius: 10,
          anchor: "center"
        });

        const stateTextY = 78;

        if (player.userState === UserState.Ready) {
          playerDisplay.z = 10001;


          k.drawText({
            text: "Ready",
            color: k.GREEN,
            pos: k.vec2(0, stateTextY),
            anchor: "center",
            size: 17
          });
        }
        else {
          playerDisplay.z = 0;

          if (player.userState === UserState.Playing) {
            k.drawText({
              text: "Playing",
              color: k.YELLOW,
              pos: k.vec2(0, stateTextY),
              anchor: "center",
              size: 17
            });
          }

          if (player.userState === UserState.Finished) {
            k.drawText({
              text: "Finished",
              color: k.rgb(194, 121, 43),
              pos: k.vec2(0, stateTextY),
              anchor: "center",
              size: 17
            });
          }
        }

        k.drawText({
          text: `Player ${i + 1}`,
          pos: k.vec2(0, -80),
          size: 17,
          color: k.WHITE,
          anchor: "center"
        });

        if (player.sessionId === room.sessionId) {
          k.drawRect({
            width: 50,
            height: 23,
            color: k.GREEN,
            pos: k.vec2(0, -55),
            anchor: "center",
            outline: { width: 2, color: k.WHITE },
            radius: 5
          })

          k.drawText({
            text: "You",
            color: k.WHITE,
            pos: k.vec2(0, -55),
            anchor: "center",
            size: 15
          });
        }
      }
      else {
        playerDisplay.z = 0;
      }
    });

  }

  k.onUpdate(() => {
    const localPlayer = room.state.players.get(room.sessionId);

    if (!localPlayer) return;

    overlay.hidden = localPlayer.userState !== UserState.Ready;
  });
}

function createOverlay() {
  return k.add([
    k.rect(k.width(), k.height()),
    k.color(k.BLACK),
    k.opacity(0.5),
    k.z(10000)
  ]);
}

function createCountDisplay(room: Room<MyRoomState>) {
  let players = room.state.players;

  const offset = 80;
  const x = k.width() - offset;
  const y = k.height() - offset;
  const textOffset = 17;

  const circle = k.add([
    k.circle(50),
    k.pos(k.vec2(x, y)),
    k.color(k.rgb(35, 35, 35)),
    k.outline(7, k.rgb(9, 6, 129)),
    k.z(10010)
  ])

  circle.onDraw(() => {
    let readyCount = [...players.values()].filter(p => p.userState === UserState.Ready).length;
    let playerCount = players.size;

    k.drawRect({
      width: 1,
      height: 100,
      angle: 45,
      pos: k.vec2(0, 0),
      color: k.rgb(39, 35, 35),
      outline: { width: 2, color: k.rgb(160, 160, 160) },
      anchor: "center"
    });

    const readyCountText = k.drawText({
      text: readyCount.toString(),
      pos: k.vec2(-textOffset, -textOffset),
      size: 25,
      color: k.WHITE,
      anchor: "center"
    });

    const playersCountText = k.drawText({
      text: playerCount.toString(),
      pos: k.vec2(textOffset, textOffset),
      size: 25,
      color: k.WHITE,
      anchor: "center"
    });
  });
}

function createRoomCodeText(room: Room<MyRoomState>) {
  const x = k.center().x;
  const y = k.center().y + 270;

  k.onDraw(() => {
    const bg = k.drawRect({
      width: 245,
      height: 50,
      radius: 5,
      pos: k.vec2(x, y + 7),
      color: k.rgb(39, 35, 35),
      outline: { width: 2, color: k.rgb(20, 20, 20) },
      anchor: "center"
    });

    const label = k.drawText({
      text: "Room Code",
      pos: k.vec2(x, y - 19),
      size: 15,
      color: k.rgb(255, 230, 0),
      anchor: "center"
    });

    const code = k.drawText({
      text: room.roomId,
      pos: k.vec2(x, y + 6),
      size: 20,
      color: k.WHITE,
      anchor: "center"
    });
  });

  const copyBtnBgColor = k.rgb(48, 48, 48);
  const copyBtnContentColor = k.rgb(59, 138, 255);

  const copyBtn = k.add([
    k.rect(35, 35, { radius: 5 }),
    k.color(k.rgb(48, 48, 48)),
    k.pos(x + 100, y + 6),
    k.anchor("center"),
    k.outline(2, k.rgb(31, 31, 31)),
    k.area(),
    {
      contentColor: copyBtnContentColor,

      draw() {
        k.drawSprite({
          sprite: "copy",
          width: 20,
          height: 20,
          pos: k.vec2(0, 0),
          color: this.contentColor,
          anchor: "center"
        });
      }
    }
  ]);

  copyBtn.onHover(() => {
    copyBtn.contentColor = k.GREEN;
  });

  copyBtn.onHoverEnd(() => {
    copyBtn.contentColor = copyBtnContentColor;
  });

  copyBtn.onClick(async () => {
    try {
      await navigator.clipboard.writeText(room.roomId);

      copyBtn.color = k.GREEN;
      copyBtn.contentColor = copyBtnContentColor;

      k.wait(0.2, () => {
        copyBtn.color = copyBtnBgColor;
      });
    } catch (err) {
      console.error("Clipboard copy failed. Enable permissions!", err);
    }

  });
}

export async function createSelector(room: Room<MyRoomState>, playerState: Player) {
  return k.add(selector(room, playerState));
}

async function createCell(room: Room<MyRoomState>, avatar: number, x: number, y: number, i: number) {
  return k.add(cell(room, avatar, x, y, i));
}