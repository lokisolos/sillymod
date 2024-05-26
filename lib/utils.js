/**
 * Logs a message in chat
 * @param {*} message - The message to be logged in chat
 */
const log = (message) => {
  ChatLib.chat(`§5§lsillymod§5 §6> §7${message}`); /* chat shorthand */
};

/**
 * Logs a message to chat with error formatting
 * @param {*} message - The message to be logged in chat
 */
const err = (message) => {
  ChatLib.chat(`§5§lsillymod§5 §6> §c${message}`); /* chat shorthand */
};

/**
 * Shorthand function to return the current time
 * @returns {number} Seconds from unix epoch
 */
const now = () => {
  return new Date().getTime(); /* get current time */
};

/**
 * Removes "§" formatting from strings
 * @param {string} string - Formatted string
 * @returns {string} String without formatting
 */
const sanitize = (string) => {
  let skip = false;
  result = "";
  for (let c in string) {
    if (skip) {
      skip = false;
      continue;
    }
    if (string[c] == "§") skip = true;
    else {
      result += string[c];
    }
  }
  return result;
};

/**
 * Converts shortened strings to numbers
 * i.e. "1k" -> 1000
 * @param {string} num - The string to be expanded
 * @returns {number} Expanded form of the string
 */
const expandNumber = (num) => {
  num = num.replace(/,/g, "");
  if (isNumeric(num[num.length - 1])) return parseFloat(num);
  return (
    parseFloat(num.substring(0, num.length - 1)) *
    { k: 1000, m: 1000000 }[num[num.length - 1]]
  );
};

/**
 * Checks to see if every character in a string is a number
 * @param {string} string - The string to be checked
 * @returns {boolean} String is numeric
 */
const isNumeric = (string) => {
  if (Number.isInteger(string)) return true;
  for (let c in string)
    if (!"0123456789".includes(string[c])) {
      return false;
    }
  return true;
};

/**
 * Checks scoreboard to see if player is in a dungeon
 * @returns {boolean|string} - Player is inside of a dungeon
 */
const inDungeon = () => {
  const scoreboard = Scoreboard.getLines();
  for (let i = 0; i < scoreboard.length; i++) {
    if (scoreboard[i].toString().includes("(F4)")) return "f4";
    else if (scoreboard[i].toString().includes("(M4)")) return "m4";
  }
  return false;
};

export { log, err, now, sanitize, expandNumber, isNumeric, inDungeon };
