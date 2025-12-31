import './index.css';
import kaplay, { AudioPlay, Color, GameObj, TimerController } from 'kaplay'
import { characterCount, GAME_HEIGHT, GAME_WIDTH } from "../../globals";
import { colyseusSDK } from "./core/colyseus";
import type { MyRoomState } from '../../server/src/rooms/schema/MyRoomState';

import { createSplashScene } from './scenes/splash';
import { createStartScene } from './scenes/start';
import { createHomeScene } from './scenes/home';
import { createLobbyScene } from './scenes/lobby';
import { createGameScene } from './scenes/game';
import { createSceneSelectScene } from './scenes/sceneSelect';
import { setListeners, setPreviousScene } from './globalListener';

// Initialize kaplay
export const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  pixelDensity: 2,
  font: "happy-o",
  debug: true,
  debugKey: "."
});

k.loadSprite("maxuostudios", "./assets/maxuostudios.png");
k.loadSprite("bevinna_logo", "./assets/bevinna_logo.png");
k.loadSprite("bevinna_bg", "./assets/bevinna_bg.jpg");
k.loadSprite("lobby_bg", "./assets/lobby_bg.jpg");
k.loadSprite("blue_bg", "./assets/blue_bg.jpg");

k.loadSprite("copy", "./assets/copy.png");
k.loadSprite("paste", "./assets/paste.png");

k.loadSprite("pointer", "./assets/pointers.png", { sliceX: 5 });
k.loadSprite("avatar", "./assets/updated_draft_lineup.png", { sliceX: characterCount });
k.loadSprite("head", "./assets/heads_for_jam.png", { sliceX: characterCount });
k.loadSprite("bg_tile", "./assets/bg_tile.png", { sliceX: 3 });
k.loadSprite("floor", "./assets/test_tile.png", { sliceX: 3 });
k.loadSprite("checkered", "./assets/checkered.png");
k.loadSprite("obstacle", "./assets/obstacle.png");

k.loadSprite("item_box", "./assets/item_box.png");
k.loadSprite("bumper_car", "./assets/bumper_car.png", { sliceX: 5 });

k.loadSprite("boost_pad_base", "./assets/boostPadBase.png");
k.loadSprite("boost_arrows", "./assets/boostArrows.png");
k.loadSprite("rainbow", "./assets/rainbow.png");

k.loadSprite("bullet", "./assets/bullet.png");
k.loadSprite("homing_bullet", "./assets/homing_bullet.png");
k.loadSprite("plant", "./assets/plant.png");
k.loadSprite("shield", "./assets/shield_bubble.png");

k.loadSprite("flag", "./assets/flag.png");

k.loadSound("start_music", "./sounds/start_music.mp3");
k.loadSound("lobby_track", "./sounds/lobby_track.mp3");
k.loadSound("game_track", "./sounds/game_track.mp3");
k.loadSound("endscreen_track", "./sounds/endscreen_track.mp3");

k.loadSound("race_intro", "./sounds/race_intro.mp3");
k.loadSound("countdown", "./sounds/countdown.mp3");
k.loadSound("race_start", "./sounds/race_start.mp3");

k.setLayers(["bg", "obj", "super-obj", "ui"], "obj");

// Create all scenes
createSplashScene();
createStartScene();
createHomeScene();
createLobbyScene();
createSceneSelectScene();
createGameScene();

export function displayHomeBackground() {
  k.drawRect({
    width: k.width(),
    height: k.height(),
    color: k.rgb(22, 78, 175)
  });
}

export function displayHomeCharacters() {
  k.drawSprite({
    sprite: "bevinna_bg",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    opacity: 0.6,
  });
}

export function displayHomeLogo() {
  k.drawSprite({
    sprite: "bevinna_logo",
    scale: k.vec2(0.6),
    pos: k.vec2(k.width() / 2, 55),
    anchor: "top",
  });
}

async function main() {
  await k.loadBitmapFont("happy-o", "././assets/happy-o.png", 31, 39);

  //k.go("home");
  k.go("splash");  
}

main();
