import { Color, GameObj, TimerController } from "kaplay";
import { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import { k, displayHomeBackground, displayHomeCharacters, displayHomeLogo } from "../App";
import { colyseusSDK } from "../core/colyseus";
import { setListeners, setPreviousScene } from "../globalListener";

type ButtonHoverData = {
    btn: GameObj;
    originalBgColor?: Color;
    originalContentColor?: Color;
    hoverBgColor?: Color;
    hoverContentColor?: Color;
};

export function setButtonHover({ btn, originalBgColor, originalContentColor, hoverBgColor, hoverContentColor }: ButtonHoverData) {
    btn.onHover(() => {
        if (hoverBgColor) btn.color = hoverBgColor;
        if (hoverContentColor) btn.contentColor = hoverContentColor;
    });

    btn.onHoverEnd(() => {
        btn.color = originalBgColor;
        btn.contentColor = originalContentColor;
    });
}

export function createHomeScene() {
    k.scene("home", () => {
        const startMusic = k.play("start_music", { loop: true });

        let errorWait: TimerController = null;
        let errorMessage: string = null;

        const inputBoxColor = k.rgb(34, 34, 34);
        const focusedInputBoxColor = k.rgb(58, 58, 58);

        let currentNameInputBoxColor = inputBoxColor;
        let currentCodeInputBoxColor = inputBoxColor;

        k.onDraw(() => {
            displayHomeBackground();

            displayHomeCharacters();

            k.drawRect({
                width: 350,
                height: 400,
                pos: k.vec2(k.width() / 2, k.height() / 2 + 50),
                color: k.rgb(32, 66, 179),
                anchor: "center",
                radius: 10,
                outline: { width: 6, color: k.rgb(19, 35, 100) }
            });

            displayHomeLogo();

            //------------------------
            // NAME CONTENT (PRE DRAW)
            //------------------------
            const nameBoxBg = k.drawRect({
                width: 300,
                height: 80,
                pos: k.vec2(k.width() / 2, k.height() / 2 - 60),
                color: k.rgb(19, 35, 100),
                anchor: "center",
                radius: 10
            });

            const nameInputBg = k.drawRect({
                width: 200,
                height: 30,
                pos: k.vec2(k.width() / 2, k.height() / 2 - 60),
                color: currentNameInputBoxColor,
                outline: { width: 2, color: k.rgb(17, 180, 221) },
                anchor: "center",
                radius: 10
            });

            //-------------------------------
            // JOIN + CODE CONTENT (PRE DRAW)
            //-------------------------------

            const codeBoxBg = k.drawRect({
                width: 300,
                height: 140,
                pos: k.vec2(k.width() / 2, k.height() / 2 + 75),
                color: k.rgb(19, 35, 100),
                anchor: "center",
                radius: 10
            });

            const codeInputBg = k.drawRect({
                width: 200,
                height: 30,
                pos: k.vec2(k.width() / 2, k.height() / 2 + 42),
                color: currentCodeInputBoxColor,
                outline: { width: 2, color: k.rgb(17, 180, 221) },
                anchor: "center",
                radius: 10
            });

            //-------------------------
            // ERROR MESSAGE (PRE DRAW)
            //-------------------------

            if (errorWait) {
                const errorMsgBg = k.drawRect({
                    width: (errorMessage.length * 10) - 30,
                    height: 40,
                    pos: k.vec2(k.width() / 2, k.height() - 25),
                    color: k.rgb(34, 34, 34),
                    outline: { width: 2, color: k.rgb(17, 180, 221) },
                    anchor: "center",
                    radius: 10,
                    opacity: 0.8
                });

                const errorMsgText = k.drawText({
                    text: errorMessage,
                    pos: k.vec2(k.width() / 2, k.height() - 25),
                    size: 10,
                    anchor: "center"
                });
            }
        });

        //-----------
        // NAME INPUT
        //-----------

        const nameInput = k.add([
            k.text("", { size: 20, align: "center" }),
            k.textInput(true, 7),
            k.pos(k.width() / 2, k.height() / 2 - 62),
            k.color(k.WHITE),
            k.anchor("center"),
            k.area({ shape: new k.Rect(k.vec2(0, 0), 200, 40) }),
            "text-input",
            "name-input",
            {
                draw() {
                    k.drawText({
                        text: "Name",
                        size: 20,
                        pos: k.vec2(0, -38),
                        anchor: "center"
                    });
                }
            }
        ]);

        //--------------------
        // JOIN INPUT & BUTTON
        //--------------------

        const codeInput = k.add([
            k.text("", { size: 20, align: "center" }),
            k.textInput(false, 9),
            k.pos(k.center().x, k.center().y + 42),
            k.color(k.WHITE),
            k.anchor("center"),
            k.area({ shape: new k.Rect(k.vec2(0, 0), 200, 30) }),
            "text-input",
            "code-input",
            {
                draw() {
                    k.drawText({
                        text: "Code",
                        size: 20,
                        pos: k.vec2(0, -38),
                        anchor: "center"
                    });
                }
            }
        ]);

        const pasteBtnBgColor = k.rgb(34, 34, 34);
        const pasteBtnContentColor = k.rgb(59, 138, 255);

        const pasteBtn = k.add([
            k.rect(35, 35, { radius: 10 }),
            k.color(pasteBtnBgColor),
            k.pos(k.center().x + 123, k.center().y + 42),
            k.anchor("center"),
            k.outline(2, k.rgb(28, 18, 173)),
            k.area(),
            {
                contentColor: pasteBtnContentColor,

                draw() {
                    k.drawSprite({
                        sprite: "paste",
                        width: 20,
                        height: 20,
                        pos: k.vec2(0, 0),
                        color: this.contentColor,
                        anchor: "center"
                    });
                }
            }
        ]);

        setButtonHover({
            btn: pasteBtn,
            originalBgColor: pasteBtnBgColor,
            originalContentColor: pasteBtnContentColor,
            hoverBgColor: k.BLACK,
            hoverContentColor: k.GREEN
        });

        pasteBtn.onClick(async () => {
            try {
                const textToPaste = (await navigator.clipboard.readText()).trim();

                if (textToPaste.length > 9) {
                    errorDisplay("Too many characters to paste!");
                    return;
                };
                if (textToPaste.length < 9) {
                    errorDisplay("Too few characters to paste!");
                    return;
                };

                codeInput.text = textToPaste;

                pasteBtn.color = k.BLACK;
                pasteBtn.contentColor = pasteBtnContentColor;

                k.wait(0.2, () => {
                    pasteBtn.color = pasteBtnBgColor;
                });
            } catch (err) {
                console.error("Clipboard paste failed. Enable permissions!", err);
            }
        });

        k.onClick(() => {
            for (const obj of k.get("text-input")) {
                obj.hasFocus = false;
                currentNameInputBoxColor = inputBoxColor;
                currentCodeInputBoxColor = inputBoxColor;
            }
        });

        k.onClick("text-input", (t) => {
            const focusedInput = k.get("text-input");
            focusedInput.map(i => i.hasFocus = false);
            t.hasFocus = true;

            if (t.is("name-input")) {
                currentNameInputBoxColor = focusedInputBoxColor;
            }
            else if (t.is("code-input")) {
                currentCodeInputBoxColor = focusedInputBoxColor;
            }
        });

        const joinNCreateBgColor = k.rgb(248, 226, 30);
        const joinNCreateContentColor = k.BLACK;

        const joinBtn = k.add([
            k.rect(100, 40, { radius: 7 }),
            k.pos(k.width() / 2, k.height() / 2 + 100),
            k.anchor("center"),
            k.color(joinNCreateBgColor),
            k.area(),
            k.outline(3, k.rgb(255, 67, 67)),
            {
                contentColor: joinNCreateContentColor,

                draw() {
                    k.drawText({
                        text: "Join",
                        size: 18,
                        color: k.BLACK,
                        anchor: "center"
                    })
                }
            }
        ]);

        setButtonHover({
            btn: joinBtn,
            originalBgColor: joinNCreateBgColor,
            hoverBgColor: k.rgb(248, 172, 30),
        });

        //--------------
        // CREATE BUTTON
        //--------------

        const createBtn = k.add([
            k.rect(100, 40, { radius: 7 }),
            k.pos(k.width() / 2, k.height() / 2 + 195),
            k.anchor("center"),
            k.color(joinNCreateBgColor),
            k.area(),
            k.outline(3, k.rgb(255, 67, 67)),
            {
                contentColor: joinNCreateContentColor,

                draw() {
                    k.drawText({
                        text: "Create",
                        size: 18,
                        color: k.BLACK,
                        anchor: "center"
                    })
                }
            }
        ]);

        setButtonHover({
            btn: createBtn,
            originalBgColor: joinNCreateBgColor,
            hoverBgColor: k.rgb(248, 172, 30),
        });

        joinBtn.onClick(async () => {
            if (codeInput.text.length === 9) {
                try {
                    const room = await colyseusSDK.joinById<MyRoomState>(codeInput.text, {
                        name: nameInput.text
                    });

                    setListeners(room);

                    startMusic.stop();
                    setPreviousScene("main");
                    k.go("lobby", room);
                } catch (e) {
                    errorDisplay("No room with that code exists!") // make it so this is generic and make better error check for room existence
                }
            }
            else {
                errorDisplay("Must enter a 9-character code to join");
            }
        });

        createBtn.onClick(async () => {
            const room = await colyseusSDK.create<MyRoomState>("my_room", {
                name: nameInput.text
            });

            setListeners(room);

            startMusic.stop();
            setPreviousScene("main");
            k.go("lobby", room);
        });

        function errorDisplay(err: string) {
            const oldErrorMessage = errorMessage;
            errorMessage = err;

            const isNewError = errorMessage !== oldErrorMessage;

            if (isNewError && errorWait) cancelErrorWait();

            if (isNewError || !errorWait) {
                errorWait = k.wait(1, () => {
                    errorMessage = null;
                    cancelErrorWait();
                });
            }

            function cancelErrorWait() {
                errorWait.cancel();
                errorWait = null;
            }
        }
    });
}