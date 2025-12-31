import { GameObj } from "kaplay";
import { k } from "../App";

export function createSplashScene() {
  k.scene("splash", () => {
    displayBackground();
    displayLogo();
  });
}

function displayBackground() {
  k.onDraw(() => {
    k.drawRect({
      width: k.width(),
      height: k.height(),
      color: k.rgb(47, 0, 189)
    });
  });
}

function displayLogo() {
    k.add([
        k.sprite("maxuostudios"),
        k.pos(k.width() / 2, k.height() / 2),
        k.scale(1.2),
        k.anchor("center"),
        k.opacity(1),
        k.animate(),
        {
            add(this: GameObj) {
                this.animate("opacity", [0, 1], {
                    duration: 1,
                    loops: 1
                })

                this.onAnimateFinished(() => {
                  k.wait(0.5, () => {
                    k.go("start");
                  });
                });
            }
        }
    ])
}