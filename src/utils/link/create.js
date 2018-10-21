const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");

const { npmCmd, globalLib } = require("../defaults");
const { lstat, symlink } = require("../filesystem");

function getGlobalNodeModulesLocation() {
  const prefixCall = spawnSync(npmCmd, ["prefix", "-g"]);
  if (prefixCall.status !== 0) {
    console.error(prefixCall.stdout.toString());
    console.error(prefixCall.stderr.toString());
    throw new Error("Failed to get global npm location.")
  }
  return path.join(prefixCall.stdout.toString().trim(), globalLib);
}

function createLink(targetPkgName, targetPkgLocation, autoOverrideLink) {
  const link = path.join(getGlobalNodeModulesLocation(), targetPkgName);
  return lstat(link)
    .then((stat) => {
      if (stat.isSymbolicLink()) {
        if (autoOverrideLink) {
          return fse.remove(link).then(() => true);
        } else {
          return false;
        }
      }  else {
        throw new Error("Cannot create link: file already exists");
      }
    }, (err) => {
      if (err && err.code === "ENOENT") {
        return true;
      } else {
        throw err;
      }
    })
    .then((createTheLink) => {
      if (createTheLink) {
        return symlink(targetPkgLocation, link, "junction");
      } else {
        console.log(`Initial link to the package ${targetPkgName} was not created.`);
      }
    })
    .catch((err) => {
      switch(err.code) {
        case "EEXIST":
          console.log(`Symlink already exists and autoOverrideLink is set to ${autoOverrideLink}. Ignoring...`, err);
          break;
        default:
          console.error("Caught an error during symlink creation", err);
          throw err;
          break;
      }
    });
}

module.exports = {
  createLink,
  getGlobalNodeModulesLocation
};
