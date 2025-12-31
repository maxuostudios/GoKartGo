export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 600;
export const MAX_PLAYERS = 5;
export const cellW = 100;
export const cellH = 100;
export const scaleSize = 1.3;
export const characterCount = 18;
export const gameLength = 120;
const playgroundSizeMultiplier = 40;
export const PLAYGROUND_WIDTH = GAME_WIDTH * playgroundSizeMultiplier;
export const PLAYGROUND_HEIGHT = GAME_HEIGHT - 100;
export const PLAYGROUND_X = GAME_WIDTH;
export const PLAYGROUND_Y = GAME_HEIGHT;
export const PLAYGROUND_ROWS = 5;
export const CELL_SIZE = PLAYGROUND_HEIGHT / PLAYGROUND_ROWS;
export const CELL_COUNT = PLAYGROUND_WIDTH / CELL_SIZE;
export const BOOST_MULTIPLIER = 1.7;
export const enum UserState {
  Unready = 0,
  Ready = 1,
  Playing = 2,
  Finished = 3
}
export enum ItemType {
  Boost = "boost_arrows",
  Bullet = "bullet",
  HomingBullet = "homing_bullet",
  Plant = "plant",
  Shield = "shield"
}
export enum ObjType {
  Wall = "wall",
  ItemBox = "item_box",
  BoostPad = "boost_pad"
}
export const p = GAME_HEIGHT - PLAYGROUND_HEIGHT / 2;
export const lapPos = [0, PLAYGROUND_WIDTH / 3, 2 * PLAYGROUND_WIDTH  / 3, PLAYGROUND_WIDTH];