export const data = {
  getConfig: function (key) {
    // RENAMING THE PARENT FOLDER OF THIS FILE WILL BREAK THIS!!!
    // DO NOT RENAME IT WITHOUT ALSO CHANGING THIS!!!
    if (!key) return JSON.parse(FileLib.read("sillymod", "metadata.json"));
    return JSON.parse(FileLib.read("sillymod", "metadata.json"))[key];
  },
  ifConfig: function (key) {
    // RENAMING THE PARENT FOLDER OF THIS FILE WILL BREAK THIS!!!
    // DO NOT RENAME IT WITHOUT ALSO CHANGING THIS!!!
    const data = JSON.parse(FileLib.read("sillymod", "metadata.json"));
    if (!data.hasOwnProperty(key)) return false;
    return data[key];
  },
  // Primarily a helper function, `setConfig()` preferred
  saveConfig: function (obj) {
    // RENAMING THE PARENT FOLDER OF THIS FILE WILL BREAK THIS!!!
    // DO NOT RENAME IT WITHOUT ALSO CHANGING THIS!!!
    FileLib.write("sillymod", "metadata.json", JSON.stringify(obj));
  },
  setConfig: function (key, val) {
    let config = this.getConfig();
    config[key] = val;
    this.saveConfig(config);
  },
};
