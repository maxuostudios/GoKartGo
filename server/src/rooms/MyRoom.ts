import { Room, Client } from "@colyseus/core";
import { v4 as uuidv4 } from "uuid";
import { MyRoomState, Player, PlayerData, Spawnable, TrackPiece } from "./schema/MyRoomState";
import { CELL_COUNT, CELL_SIZE, GAME_HEIGHT, GAME_WIDTH, ItemType, lapPos, MAX_PLAYERS, ObjType, p, PLAYGROUND_HEIGHT, PLAYGROUND_WIDTH, PLAYGROUND_X, PLAYGROUND_Y, UserState } from "../../../globals";
import { getColor, prob, randomInt, randomItem } from "../../../utils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const itemWeights = [
    10,  // Boost
    40,  // Bullet
    25,  // HomingBullet
    20,  // Plant
    5,   // Shield
]

export class MyRoom extends Room {
  maxClients = MAX_PLAYERS;
  state = new MyRoomState();

  LOBBY_CHANNEL = "$mylobby"

  generateRoomIdSingle(): string {
        let result = '';
        for (var i = 0; i < 4; i++) {
            result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
        }
        return result;
    }
    
    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));
 
        await this.presence.sadd(this.LOBBY_CHANNEL, id);
        return id;
    }

  async onCreate() {
    this.roomId = await this.generateRoomId();

    this.setInitState();

    this.setSimulationInterval((dt) => {
      if (this.state.countdownTimer > 0) return;
      this.state.gameTime += dt / 1000;

      this.state.players.forEach((player) => {
        const deltaSeconds = dt / 1000;

        if (player.boostTime > 0) {
          player.boostTime = Math.max(0, player.boostTime - deltaSeconds);
        }

        if (player.stunTime > 0) {
          player.stunTime = Math.max(0, player.stunTime - deltaSeconds);
        }

        if (player.shieldTime > 0) {
          player.shieldTime = Math.max(0, player.shieldTime - deltaSeconds);
        }
      });
    });

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.x = message.pos.x;
      player.y = message.pos.y;

      const EPS = 20;

      if (lapPos.slice(1, -1).some(l => Math.abs(l - player.x) <= EPS)) {
        client.send("checkpointReached");
      }

      if (player.x >= lapPos[lapPos.length - 1] + CELL_SIZE) {
        player.userState = UserState.Finished;
        player.finishTime = this.state.gameTime;

        this.state.finishedPlayers.set(player.sessionId, new PlayerData({
          name: player.name,
          sessionId: player.sessionId,
          avatar: player.avatar,
          ranking: player.ranking,
          finishTime: player.finishTime
        }));

        client.send("raceFinished", client);
      }
    });

    this.onMessage("updateRanking", (client, rankings) => {
      this.state.players.forEach((p) => {
        const rankingForPlayer = rankings.find((r: any) => r.sessionId === p.sessionId);
        if (rankingForPlayer) {
          p.ranking = rankingForPlayer.ranking;
        }
      });
    });

    // BOOST
    this.onMessage("boost", (client, time) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.boostTime += time;
    });

    // STUN
    this.onMessage("hitPlayer", (client, data) => {
      const target = this.state.players.get(data.targetId);
      if (!target) return;

      // Shield
      if (target.shieldTime > 0) {
        target.shieldTime = 0;
        return;
      }

      // Stun
      target.stunTime += data.duration;
    });

    // SHIELD
    this.onMessage("shield", (client, time) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.shieldTime += time;
    });

    // MOVE
    this.onMessage("selectorMove", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.selectorX = message.x;
      player.selectorY = message.y;
    });

    this.onMessage("changeSpeed", (client, speed) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.speed = speed;
    });

    this.onMessage("addItem", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      let itemToAdd = Object.values(ItemType)[prob(itemWeights)];

      while (player.itemOne === itemToAdd || player.itemTwo === itemToAdd) {
        itemToAdd = Object.values(ItemType)[prob(itemWeights)];
      }

      if (!player.itemOne) player.itemOne = itemToAdd;
      else if (!player.itemTwo) player.itemTwo = itemToAdd;
    });

    this.onMessage("useItem", (client, { itemType, itemBoxIndex }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (itemBoxIndex === 1) player.itemOne = null;
      else if (itemBoxIndex === 2) player.itemTwo = null;

      if (itemType === "boost_arrows") {
        const player = this.state.players.get(client.sessionId);
        player.boostTime += 0.4;
      }
      else if (itemType === "shield") {
        const player = this.state.players.get(client.sessionId);
        player.shieldTime += 5.5;
      }
      else {
        const spawnable = new Spawnable();
        spawnable.id = uuidv4();
        spawnable.type = itemType;
        spawnable.x = player.x;
        spawnable.y = player.y;
        spawnable.owner = client.sessionId;

        this.state.spawnables.set(spawnable.id, spawnable);
      }
    });

    this.onMessage("objectDestroyed", (client, spawnableId) => {
      this.state.spawnables.delete(spawnableId);
    });

    this.onMessage("hoverCell", (client, avatar) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.avatar = avatar;
    });

    this.onMessage("selectCell", (client, cellIndex) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      for (const p of this.state.players.values()) {
        if (p.selectedCell === cellIndex) return;
      }

      player.selectedCell = cellIndex;

      player.userState = UserState.Ready;

      // check if all ready
      const playersTotalCount = this.state.players.size;

      if (!this.state.gameInProgress && playersTotalCount > 0 && this.state.players.values().every(p => p.userState === UserState.Ready)) {
        this.state.gameInProgress = true;
        this.prepareGame();
      }
    });

    this.onMessage("deselectCell", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.selectedCell = null;

      if (player.userState !== UserState.Playing &&
        player.userState !== UserState.Finished) {
        player.userState = UserState.Unready;
      }
    });

    this.onMessage("returnedToLobby", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.userState = UserState.Unready;
      player.selectedCell = -1;

      if (this.state.players.values().every(p => p.userState === UserState.Ready || p.userState === UserState.Unready)) {
        this.resetPlayers();
        this.setInitState();
      }
    });

    this.onMessage(
      "event",
      (
        client,
        { name, exceptLocal, data }: {
          name?: string;
          exceptLocal?: boolean;
          data?: any;
        } = {},
      ) => {
        this.broadcast(
          name ? `event:${name}` : "event",
          data,
          exceptLocal && { except: client },
        );
      },
    );
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.name = options.name.length > 0 ? options.name : `Guest${client.sessionId.slice(0, 3)}`;
    player.sessionId = client.sessionId;

    this.state.players.set(client.sessionId, player);

    const remainingPlayers = Array.from(this.state.players.values());

    remainingPlayers.forEach((player, i) => {
      player.playerNumber = i;
    });

    player.selectorX = 130;
    player.selectorY = 240 + player.playerNumber * 60;
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    const remainingPlayers = Array.from(this.state.players.values());

    remainingPlayers.forEach((player, i) => {
      player.playerNumber = i;
    });
  }

  async onDispose() {
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
  }

  //------------------
  // HELPER FUNCTIONS
  //------------------

  /*resetScore() {
    this.state.score;

    this.broadcast("score", "0");
  }*/

  async prepareGame() {
    // set as playing
    this.state.players.forEach((p) => {
      p.userState = UserState.Playing;
      p.x = -140;
      p.y = this.setStartPos(p.playerNumber);
      this.state.playingPlayers.push(p.sessionId);
    });

    // enter players into scene select
    this.broadcast("sceneSelectEnter");

    // select theme
    this.state.themeIndex = randomInt(3);

    // generate track
    this.trackGenerator();

    const randomiserWait = this.clock.setTimeout(() => {
      this.broadcast("randomiseComplete");

      const enterGameWait = this.clock.setTimeout(() => {
        enterGameScene();
      }, 1300);
    }, 1700);

    const enterGameScene = () => {
      this.broadcast("gameSceneEnter");

      const timeTillCountdown = this.clock.setInterval(() => {
        this.state.timeTillCountdown -= 1;

        if (this.state.timeTillCountdown <= 0) {
          timeTillCountdown.clear();

          const countdownTimer = this.clock.setInterval(() => {
            if (this.state.countdownTimer > 0) {
              this.broadcast("countdown");
              this.state.countdownTimer -= 1;
            } else {
              this.broadcast("raceStart");
              countdownTimer.clear();
            }
          }, 1000);
        }
      }, 1000);
    }
  }

  setStartPos(index: number) {
    return p - 160 + (100 * index);
  }

  trackGenerator() {
    const startX = 2;

    const weights = {
      wallArea: 60,
      itemBoxes: 25,
      boostPads: 15
    }

    for (let i = 0; i < CELL_COUNT; i += 5) {
      if (i < startX) continue;

      const col = i;
      const xPos = col * CELL_SIZE;

      let type;
      let amount;
      let locations;

      switch (prob(Object.values(weights))) {
        case 0: // Wall Area
          type = ObjType.Wall;
          amount = randomInt(3) + 1;
          locations = randomInt(5, 3);
          break;
        case 1: // Item Boxes
          type = ObjType.ItemBox;
          amount = randomInt(3) + 1;
          locations = randomInt(5, 3);
          break;
        case 2: // Boost Pads
          type = ObjType.BoostPad;
          amount = randomInt(3) + 1;
          locations = randomInt(5, 3);
          break;
        default:
          break;
      }

      const t = new TrackPiece();

      t.col = col;
      t.xPos = xPos;
      t.type = type;
      t.amount = amount;
      t.locations = locations;

      this.state.generatedTrack.push(t);
    }
  }

  resetPlayers() {
    this.state.players.forEach(p => {
      p.x = -140;
      p.y = this.setStartPos(p.playerNumber);;
      p.itemOne = null;
      p.itemTwo = null;
      p.speed = 0;
      p.boostTime = 0;
      p.stunTime = 0;
      p.shieldTime = 0;
      p.currentLap = 0;
      p.ranking = 1;
      p.finishTime = 0;
    });
  }

  setInitState() {
    this.state.spawnables.clear();
    this.state.gameTime = 0;
    this.state.timeTillCountdown = 2;
    this.state.countdownTimer = 3;
    this.state.generatedTrack.clear();
    this.state.playingPlayers = [];
    this.state.finishedPlayers.clear();
    this.state.themeIndex = -1;
    this.state.gameInProgress = false;
  }
}
