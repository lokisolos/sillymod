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

import { data } from "./lib/save.js";
import { Settings } from "./lib/settings.js";
import { BearDisplay } from "./lib/display.js";
import { log } from "./lib/utils.js";

register("worldLoad", () => {
  if (data.getConfig("firstlogin") == 1) {
    help();
    log(
      "This message was displayed because this is your first login with §5§lsillymod§r§7, to see it again use §d/sillymod help§7."
    );
    ChatLib.chat(
      "§6" +
        ChatLib.getChatBreak("-") +
        "§r\n" +
        ChatLib.getCenteredText("§5§lsillymod §d(v1.1)") +
        "§r\n" +
        "§6" +
        ChatLib.getChatBreak("-") +
        "§r\n" +
        "§d§ka§r §5§lUPDATE! §d§ka§r §6- §r§5(v1.1 5/25/24)" +
        "§r\n" +
        "§5‣ §7/sm config GUI added\n§r" +
        "§5‣ §7Added an auto-remove friends command\n" +
        "§5‣ §7Massive refactoring under the hood\n" +
        "§6" +
        ChatLib.getChatBreak("-")
    );
    data.setConfig("firstlogin", 0);
  }
});

register("command", (command, ...args) => {
  if (!command) command = "help";
  switch (command.toLowerCase()) {
    case "help":
      help();
      break;
    case "config":
      Settings.openGUI();
      break;
    case "move":
      BearDisplay.move();
      break;
    case "start":
      BearDisplay.start();
      break;
    case "stop":
      BearDisplay.reset();
      log("Stopped timer");
      break;
    case "fremove":
      fremove(args);
      return;
    case "fkeep":
      fkeep(args);
      return;
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
      ChatLib.getCenteredText("§d§ka§r §5§lsillymod §d(v1.1) §d§ka§r") +
      "§r\n" +
      "§6" +
      ChatLib.getChatBreak("-") +
      "§r\n" +
      '§5§lPRO  TIP!§6 - §7"§5/sm§7" works as an alias of "§5/sillymod§7"!\n' +
      "§5/sillymod §dhelp§6 - §7§oSends this message in chat\n" +
      "§5/sillymod §dconfig (§5/smc§d)§6 - §7§oOpens settings menu\n" +
      "§5/sillymod §d[start/stop] §6 - §7§oToggle timer if it didn't start auto\n" +
      "§5/sillymod §dfremove §6 - §7§oQueues an ign to remove if they leave\n" +
      "§5/sillymod §dfkeep §6 - §7§oWill stop fremove from removing a friend\n" +
      "§6" +
      ChatLib.getChatBreak("-")
  );
}

function fkeep(args) {
  if (args.length != 1) {
    log("Specify a user to remove from the fremove queue!");
    return;
  }
  const list = data.getConfig("remove");
  const index = list.indexOf(args[0]);
  if (index == -1) {
    log(`§c${args[0]} isn't even queued to be removed! youre so stupid!`);
    return;
  }
  list.splice(index, 1);
  data.setConfig("remove", list);
  log(`${args[0]} will no longer be removed from your friend's list`);
}

function fremove(args) {
  if (args.length != 1) {
    log("Specify a user to be removed when they log off.");
    return;
  }
  const ign = args[0];
  const list = data.getConfig("remove");
  list.push(ign);
  data.setConfig("remove", list);
  log(`§c${ign} will be removed from your friend's list when they log off.`);
}

const leaveListener = (ign) => {
  const removel = data.ifConfig("remove");
  if (!removel) {
    return;
  }
  for (var toremove = 0; toremove < removel.length; toremove++) {
    if (removel[toremove].toLowerCase() == ign.toLowerCase()) {
      ChatLib.command(`f remove ${ign}`);
      removel.splice(toremove, 1);
      data.setConfig("remove", removel);
      return;
    }
  }
};

register("chat", leaveListener).setCriteria("Friend > ${friend} left.");
register("chat", leaveListener).setCriteria("Guild > ${friend} left.");

register("command", () => {
  ChatLib.command("warp dhub");
}).setName("dh");

register("command", Settings.openGUI).setName("smc");
