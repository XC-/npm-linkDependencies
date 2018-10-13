const path = require("path");

let npmCmd;
let globalLib;

if (process.platform === "win32") {
  npmCmd = "npm.cmd";
  globalLib = "node_modules";
} else {
  npmCmd = "npm";
  globalLib = path.join("lib", "node_modules");
}

module.exports = {
  npmCmd,
  globalLib
};
