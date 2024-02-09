module.exports = {
  getConfig: function (key) {
    // RENAMING THE PARENT FOLDER OF THIS FILE WILL BREAK THIS!!!
    // DO NOT RENAME IT WITHOUT ALSO CHANGING THIS!!!
    if (!key) return JSON.parse(FileLib.read("sillymod", "config.json"));
    return JSON.parse(FileLib.read("sillymod", "config.json"))[key];
  },
  // Primarily a helper function, `setConfig()` preferred
  saveConfig: function (obj) {
    // RENAMING THE PARENT FOLDER OF THIS FILE WILL BREAK THIS!!!
    // DO NOT RENAME IT WITHOUT ALSO CHANGING THIS!!!
    FileLib.write("sillymod", "config.json", JSON.stringify(obj));
  },
  setConfig: function (key, val) {
    let config = this.getConfig();
    config[key] = val;
    this.saveConfig(config);
  },
};
