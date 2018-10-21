const path = require("path");
const { spawnSync } = require("child_process");

const LD_FIELD = "linkDependencies";

let npmCmd;
let globalLib;

if (process.platform === "win32") {
  npmCmd = "npm.cmd";
  globalLib = "node_modules";
} else {
  npmCmd = "npm";
  globalLib = path.join("lib", "node_modules");
}

const npmGlobalLibPath = path.join(spawnSync(npmCmd, ["prefix", "-g"]).stdout.toString().trim(), globalLib);

module.exports = {
  npmCmd,
  globalLib,
  LD_FIELD,
  npmGlobalLibPath
};
