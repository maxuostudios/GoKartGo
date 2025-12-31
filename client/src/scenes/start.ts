import { displayHomeBackground, displayHomeCharacters, displayHomeLogo, k } from "../App";
import { displayBlinkingUIMessage } from "../localUtils";

export function createStartScene() {
  k.scene("start", () => {
    k.onDraw(() => {
      displayHomeBackground();
      displayHomeCharacters();
      displayHomeLogo();
    })

    displayBlinkingUIMessage(
      "\\[Hit Space to play\\]",
      k.vec2(k.center().x, k.center().y + 200),
      1
    )

    k.onKeyPress("space", () => {
      k.go("home");
    });
  });
}