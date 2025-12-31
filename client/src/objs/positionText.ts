import { Room } from "colyseus.js";
import type { GameObj } from "kaplay";
import type { MyRoomState, Player, PlayerData } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { GAME_WIDTH, UserState } from "../../../globals";
import { getRankingName } from "../../../utils";

export default (room: Room<MyRoomState>) => [
  k.text("-"),
  k.anchor("topright"),
  k.pos(GAME_WIDTH - 30, 30),
  k.fixed(),
  k.z(9998),
  k.animate(),
  {
    update(this: GameObj) {
      // fix?
      if (room.state.players.get(room.sessionId).playerNumber === 0) {
        getRanking(room);
      }

      const player = room.state.players.get(room.sessionId);
      this.text = getRankingName(player.ranking);
    }
  },
];

function getRanking(room: Room) {
  const playingPlayers = room.state.playingPlayers;
  const finishedPlayers = room.state.finishedPlayers;

  const sortedPlayers = playingPlayers
    .slice()
    .sort((a: string, b: string) => {
      const finishedA = finishedPlayers.get(a);
      const finishedB = finishedPlayers.get(b);

      // Finish time check
      if (finishedA && finishedB) return finishedA.finishTime - finishedB.finishTime;

      if (finishedA) return -1;
      if (finishedB) return 1;

      // Distance covered check
      const distanceA = getDistance(a);
      const distanceB = getDistance(b);

      return distanceB - distanceA;
    })
    .map((sessionId: string, index: number) => ({
      sessionId,
      ranking: index + 1,
    }));

  room.send("updateRanking", sortedPlayers);

  function getDistance(sessionId: string): number {
    return room.state.players.get(sessionId)?.x ?? 0;
  }
}
