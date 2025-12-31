import { GameObj, Vec2 } from "kaplay";
import { k } from "./App";

export function setOffscreenChecks(obj: GameObj) {
    obj.onEnterScreen(() => {
        obj.use(k.area());
    });

    obj.onExitScreen(() => {
        obj.unuse("area");
    });
}

export function displayBlinkingUIMessage(content: string, position: Vec2, speed: number) {
    const message = k.add([
        k.text(content),
        k.area(),
        k.anchor("center"),
        k.pos(position),
        k.opacity(),
        k.state("flash-up", ["flash-up", "flash-down"]),
    ])

    message.onStateEnter("flash-up", async () => {
        await k.tween(
            message.opacity,
            0,
            speed,
            (val) => message.opacity = val,
            k.easings.linear
        )
        message.enterState("flash-down")
    })

    message.onStateEnter("flash-down", async () => {
        await k.tween(
            message.opacity,
            1,
            speed,
            (val) => message.opacity = val,
            k.easings.linear
        )
        message.enterState("flash-up")
    })
}

export let currentTrack: any;

export function setCurrentTrack(track: any) {
    currentTrack = track;
}