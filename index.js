/*
Copyright (c) 2024 lokisolos inc. (lokisolos20@gmail.com)

A couple of things to consider:
    - Currently the mod is not very efficient (in any aspect)
    - Customization is a pain
    - I will only update this by request

 =============================
          sillymod
 =============================
    * Features a working bear split GUI
    * With more features coming soon!
    
# TODO:
    [DONE 2/3/24] * Make display auto-hide after leaving boss 
    [DONE 2/4/24] * add rest of help commands
    * make display use block instead of chat messages
*/

const data = require("./save.js");

// time savers
const log = (message) => {
  ChatLib.chat("§5§lsillymod§5 §6> §7" + message); /* chat shorthand */
};
const now = () => {
  return Client.Companion.getSystemTime(); /* get current time */
};
const fillDisplay = () => {
  for (let x = 1; x <= data.getConfig("lenLimit"); x++)
    display.setLine(x - 1, `Bear ${x}:    0  (0)`);
};

const isNumeric = (string) => {
  for (let c in string)
    if (!"0123456789".includes(string[c])) {
      return false;
    }
  return true;
};

const reset = () => {
  display.hide();
  display.clearLines();
  bearSpawnTimes = [];
  bearDieTimes = [];
  enteredTime = null;
  currentBear = 0;
  pause = false;
};

const display = new Display();
display.hide();

display.setRenderX(data.getConfig("renderX"));
display.setRenderY(data.getConfig("renderY"));

let bg = data.getConfig("bgcolor");
display
  .setBackgroundColor(Renderer.color(bg["r"], bg["g"], bg["b"], bg["a"]))
  .setBackground(data.getConfig("bg"));
let color = data.getConfig("text");
display.setTextColor(Renderer.color(color["r"], color["g"], color["b"]));

let currentBear = 0;
let enteredTime = null;
var bearSpawnTimes = [];
var bearDieTimes = [];
let pause = false;

/* legacy */
// display.addLine("Bear 1: 0.00s");
// display.addLine("Bear 2: 0.00s");
// display.addLine("Bear 3: 0.00s");

register("worldLoad", () => {
  if (data.getConfig("firstlogin") == 0) {
    help();
    log(
      "This message was displayed because this is your first login with §5§lsillymod§r§7, to see it again use §d/sillymod help§7."
    );
    data.setConfig("firstlogin", 1);
  }
});

register("renderOverlay", () => {
  if (currentBear == 0) return;
  if (bearDieTimes.length >= data.getConfig("lenLimit")) return;
  if (pause) return;
  let t = (now() - bearSpawnTimes[currentBear - 1]) / 1000;
  if (isNaN(t)) {
    t = "0";
  } else {
    t = `${t.toFixed(2)}s`;
  }
  display.setLine(
    currentBear - 1,
    `Bear ${currentBear}:    ${((now() - enteredTime) / 1000).toFixed(
      2
    )}s (${t}) `
  );
});

// Auto-hide when out of dungeon.
register("chat", () => {
  if (currentBear == 0) return;
  if (Scoreboard.getLines().length < 7) {
    reset();
    return;
  }
  /*
   * This is very much not a counterintuitive method, however,
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
  var flag = false;
  const scoreboard = Scoreboard.getLines();
  for (let i = 0; i < scoreboard.length; i++) {
    if (
      scoreboard[i].toString().includes("(F4)") ||
      scoreboard[i].toString().includes("(M4)") //||
      //scoreboard[i].toString() == " §7⏣ §cThe Catac👾§combs §7(F4)"
    )
      flag = true;
  }
  if (!flag) {
    reset();
  }
});

register("chat", () => {
  pause = true;
}).setCriteria("                        The Catacombs - Floor IV");

register("chat", () => {
  pause = true;
}).setCriteria("                   Master Mode Catacombs - Floor IV");

register("chat", () => {
  bearSpawnTimes.push(now());
}).setCriteria("A Spirit Bear has appeared!");

register("chat", () => {
  if (bearSpawnTimes.length == 0) {
    // In the event that the mod is enabled after a bear is killed,
    // we'll ignore it since we can't know when it spawned
    return;
  }
  currentBear++;
  bearDieTimes.push(now());
}).setCriteria("The Spirit Bow has dropped!");

// Show display & start timer
register("chat", () => {
  log("Timer started; Boss entered.");
  enteredTime = now();
  currentBear = 1;
  fillDisplay();
  display.show();
}).setCriteria(
  "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!"
);

// debug
register("command", () => {
  if (enteredTime === null) {
    ChatLib.chat("Haven't entered boss yet!");
    return;
  }
  ChatLib.chat(`${(now() - enteredTime) / 1000} seconds elapsed.`);
}).setName("/");

register("command", (command, ...args) => {
  if (!command) command = "help";
  switch (command.toLowerCase()) {
    case "help":
      help();
      break;
    case "setcolor":
      setcolor(args);
      break;
    case "setbg":
      setbg(args);
      break;
    case "togglebg":
      togglebg();
      data.setConfig("bg", display.getBackground().toString());
      break;
    case "setlimit":
      setlimit(args);
      break;
    case "move":
      move();
      break;
    default:
      log("Unknown command, use §d/sillymod help§7 for more information.");
  }
})
  .setName("sillymod")
  .setAliases("sm");

function help() {
  ChatLib.chat(
    "§6" +
      ChatLib.getChatBreak("-") +
      "§r\n" +
      ChatLib.getCenteredText("§5§lsillymod §d(v1.0)") +
      "§r\n" +
      "§6" +
      ChatLib.getChatBreak("-") +
      "§r\n" +
      '§5§lPRO TIP!§6 - §7"§5/sm§7" works as an alias of "§5/sillymod§7"!\n' +
      "§5/sillymod §dhelp§6 - §7§oSends this message in chat.\n" +
      "§5/sillymod §dmove§6 - §7§oMove bear split display (GUI).\n" +
      "§5/sillymod §dsetlimit §5<amount>§6 - §7§oSets the max amount of display lines.\n" +
      "§5/sillymod §dsetcolor §5<r> <g> <b>§6 - §7§oSets text color of the display.\n" +
      "§5/sillymod §dsetbg §5<r> <g> <b> <a>§6 - §7§oSets background of the display.\n" +
      "§5/sillymod §dtogglebg §6 - §7§oToggles display background.\n" +
      "§6" +
      ChatLib.getChatBreak("-")
  );
}

function togglebg() {
  if (display.getBackground() == "FULL") {
    display.setBackground("NONE");
    log("Toggled background visibility off.");
    return;
  }
  display.setBackground("FULL");
  log("Toggled background visibility on.");
}
function setcolor(args) {
  if (args.length < 3) {
    log(
      "Usage: /sillymod setcolor <r> <g> <b> (ex: /sillymod setcolor 255 0 0)"
    );
    return;
  }
  for (let i = 0; i < 3; i++) {
    if (!isNumeric(args[i])) {
      log("Invalid parameter! (ex: /sillymod setcolor 255 0 0)");
      return;
    }
  }
  display.setTextColor(
    Renderer.color(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]))
  );
  const con = data.getConfig();
  con["text"]["r"] = parseInt(args[0]);
  con["text"]["g"] = parseInt(args[1]);
  con["text"]["b"] = parseInt(args[2]);
  data.saveConfig(con);
  log(`Set text color to §d(${args[0]}, ${args[1]}, ${args[2]})§7.`);
}

function setbg(args) {
  if (args.length < 4) {
    log(
      "Usage: /sillymod setbg <r> <g> <b> <transparency> (ex: /sillymod setbg 255 0 0 50)"
    );
    return;
  }
  for (let i = 0; i < 4; i++) {
    if (!isNumeric(args[i])) {
      log("Invalid parameter! (ex: /sillymod setbg 255 0 0 50)");
      return;
    }
  }
  display.setBackgroundColor(
    Renderer.color(
      parseInt(args[0]),
      parseInt(args[1]),
      parseInt(args[2]),
      parseInt(args[3])
    )
  );
  const con = data.getConfig();
  con["bgcolor"]["r"] = parseInt(args[0]);
  con["bgcolor"]["g"] = parseInt(args[1]);
  con["bgcolor"]["b"] = parseInt(args[2]);
  con["bgcolor"]["a"] = parseInt(args[3]);
  data.saveConfig(con);
  log(`Set background color to §d(${args[0]}, ${args[1]}, ${args[2]})§7.`);
}

function setlimit(args) {
  if (!args || args.length == 0) {
    log("Usage: /sillymod setlimit <amount> (ex: /sillymod setlimit 4)");
    return;
  }
  const num = args[0];
  for (let c in num)
    if (!"0123456789".includes(num[c])) {
      log("Invalid parameter! Must be a number (ex: 5).");
      return;
    }
  data.setConfig("lenLimit", parseInt(num));
  log("Set bear display line limit to §d" + num + "§7.");
  if (display.getShouldRender()) {
    for (let i = display.getLines().length; i > parseInt(num); i--) {
      display.removeLine(i);
    }
  }
}

function move() {
  log("Move mouse to select position, click to finalize.");
  const gui = new Gui();
  gui.open();

  const wasShowing = display.getShouldRender();
  if (!wasShowing) {
    fillDisplay();
  }
  display.show();

  gui.registerDraw((mX, mY, pTick) => {
    display.setRenderX(mX);
    display.setRenderY(mY);
  });
  const closeGUI = () => {
    if (wasShowing) return;
    display.clearLines();
    display.hide();
  };
  gui.registerClosed(closeGUI);
  gui.registerClicked(() => {
    closeGUI();
    data.setConfig("renderX", display.getRenderX());
    data.setConfig("renderY", display.getRenderY());
    gui.close();
    log(
      `Saved position as §5(${display.getRenderX()}, ${display.getRenderY()})§7.`
    );
  });
}
