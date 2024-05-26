import { Settings } from "./settings.js";
import { log, now, inDungeon } from "./utils.js";

class ExtendedDisplay {
  /**
   * Hide the display
   */
  hide() {
    this.display.hide();
  }

  /**
   * Show the display
   */
  show() {
    this.display.show();
  }

  /**
   * Reset display variables
   */
  reset() {
    this.hide();
    this.display.clearLines();
    this.bearSpawnTimes = [];
    this.bearDieTimes = [];
    this.enteredTime = null;
    this.currentBear = 0;
    this.pause = false;
  }

  /**
   * Fill the display with decoy lines
   * (Intended for this.move)
   */
  fillDisplay() {
    for (let x = 1; x <= Settings.lineLimit; x++)
      this.display.setLine(x - 1, `Bear ${x}:    0  (0)`);
  }

  /**
   * Move the display
   */
  move() {
    log("Move mouse to select position, click to finalize.");
    this.moveGUI.open();

    this.wasShowing = this.display.getShouldRender();
    if (!this.wasShowing) {
      this.fillDisplay();
    }
    this.display.show();
  }

  /**
   * Start timer in case it failed
   * to start automatically
   */
  start() {
    log("Timer started; Boss entered.");
    this.enteredTime = now();
    this.currentBear = 1;
    this.show();
    this.display.addLine("hi");
  }

  /**
   * Update text foreground color
   */
  updateTextColor() {
    let color = Settings.foreground;
    this.display.setTextColor(
      Renderer.color(color.red, color.green, color.blue, color.alpha)
    );
  }

  /**
   * Update display background color
   */
  updateBackgroundColor() {
    let bg = Settings.background;
    this.display.setBackgroundColor(
      Renderer.color(bg.red, bg.green, bg.blue, bg.alpha)
    );
  }

  /**
   * Update whether the display should render a background
   * or not
   */
  updateBackgroundToggle() {
    this.display.setBackground(!Settings.displayBackground ? "FULL" : "NONE");
  }

  /**
   * Update display X position
   */
  updateXPosition() {
    this.display.setRenderX(Settings.renderX);
  }

  /**
   * Update display Y position
   */
  updateYPosition() {
    this.display.setRenderY(Settings.renderY);
  }

  constructor() {
    this.display = new Display();
    this.currentBear = 0;
    this.bearDieTimes = [];
    this.bearKillTimes = [];
    this.bearSpawnTimes = [];
    this.enteredTime = null;
    this.pause = false;
    this.moveGUI = new Gui();
    this.wasShowing = false;

    this.updateTextColor();
    this.updateBackgroundColor();
    this.updateXPosition();
    this.updateYPosition();
    this.display.setBackground(Settings.displayBackground ? "FULL" : "NONE");

    Settings.registerListener("Text color", this.updateTextColor.bind(this));
    // prettier-ignore
    Settings.registerListener("Background color", this.updateBackgroundColor.bind(this));
    // prettier-ignore
    Settings.registerListener("Display Background", this.updateBackgroundToggle.bind(this));
    Settings.registerListener("X Position", this.updateXPosition.bind(this));
    Settings.registerListener("Y Position", this.updateYPosition.bind(this));

    Settings.moveCommand = this.move.bind(this);

    this.display.hide();

    register("renderOverlay", () => {
      if (this.currentBear == 0) return;
      if (this.bearDieTimes.length >= Settings.lineLimit) return;
      if (this.pause) return;

      let t = (now() - this.bearSpawnTimes[this.currentBear - 1]) / 1000;

      if (isNaN(t)) {
        t = "0";
      } else {
        t = `${t.toFixed(2)}s`;
      }

      this.display.setLine(
        this.currentBear - 1,
        ` Bear ${this.currentBear}:    ${(
          (now() - this.enteredTime) /
          1000
        ).toFixed(2)}s (${t}) `
      );
    });

    register("chat", () => {
      this.bearSpawnTimes.push(now());
    }).setCriteria("A Spirit Bear has appeared!");

    register("chat", () => {
      if (this.bearSpawnTimes.length == 0) {
        // In the event that the mod is enabled after a bear is killed,
        // we'll ignore it since we can't know when it spawned
        return;
      }
      this.bearKillTimes.push(
        (now() - this.bearSpawnTimes[this.currentBear - 1]) / 1000
      );
      this.currentBear++;
      this.bearDieTimes.push(now());
    }).setCriteria("The Spirit Bow has dropped!");

    register("chat", () => {
      log("Timer started; Boss entered.");
      this.enteredTime = now();
      this.currentBear = 1;
      // fillDisplay();
      this.show();
    }).setCriteria(
      "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!"
    );

    register("chat", () => {
      this.pause = true;
    }).setCriteria("                        The Catacombs - Floor IV");

    register("chat", () => {
      this.pause = true;
    }).setCriteria("                   Master Mode Catacombs - Floor IV");

    // Auto-hide when out of dungeon.
    register("chat", () => {
      if (this.currentBear == 0) return;
      if (Scoreboard.getLines().length < 7) {
        this.reset();
        return;
      }
      /*
       * 2/21/24: im working on a better workaround for this!
       * This is very much a counterintuitive method, however,
       * let me put something into perspective.
       * 10:30 PM - implemented auto-hiding by using chat, checks 7th line of scoreboard
       * 11:00 PM - implemented the above but with m4
       * 1:00 AM - suddenly does not work
       * 2:30 AM - time i am writing this, apparently the scoreboard randomly gains and loses
       * elements, making checking an indidivual position unviable; i have no clue as to why
       * or how this happens, and why it was working earlier, but hopefully this should fix it.
       * 2:40 PM - Proposed fix didn't work, the message in the leaderboard changes randomly
       * and I don't know why, for example: §7⏣ §cThe Catac🌠§combs §7(F4) vs
       * §7⏣ §cThe Catac👾§combs §7(F4)
       */
      if (!inDungeon()) {
        this.reset();
      }
    });

    this.moveGUI.registerDraw((mX, mY, pTick) => {
      this.display.setRenderX(mX);
      this.display.setRenderY(mY);
      this.moveGUI.drawString(
        "Move mouse to select positon - Click screen to finalize.",
        Renderer.screen.getWidth() / 2 -
          Renderer.getStringWidth(
            "Move mouse to select positon - Click screen to finalize."
          ) /
            2,
        50,
        Renderer.WHITE
      );
    });

    const closeGUI = () => {
      if (this.wasShowing) return;
      this.display.clearLines();
      this.display.hide();
    };

    this.moveGUI.registerClosed(closeGUI);
    this.moveGUI.registerClicked(() => {
      closeGUI();
      Settings.renderX = this.display.getRenderX();
      Settings.renderY = this.display.getRenderY();
      this.moveGUI.close();
      log(
        `Saved position as §5(${this.display.getRenderX()}, ${this.display.getRenderY()})§7.`
      );
    });
  }
}

export const BearDisplay = new ExtendedDisplay();
