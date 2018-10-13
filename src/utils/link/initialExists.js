const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { npmCmd, globalLib } = require("../defaults");

function checkIfInitialLinkExists(pkg) {
  const npmPrefix = spawnSync(npmCmd, ["prefix", "-g"]).stdout.toString().trim();
  const libPath = path.join(npmPrefix, globalLib, pkg);
  return fs.existsSync(libPath) && fs.lstatSync(libPath).isSymbolicLink();
}

module.exports = {
  checkIfInitialLinkExists
};
