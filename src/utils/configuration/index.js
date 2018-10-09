const path = require("path");

const { validateSettings } = require("./validateConfiguration");
const defaults = require("./defaults.json");

const LINK_DEPENDENCIES_CONF_KEY = "linkDependencies";

function readSettings(dir) {
  const packageJson = require(path.join(dir, "package.json"));

  if (Object.keys(packageJson).indexOf(LINK_DEPENDENCIES_CONF_KEY) > -1) {
    return Object.assign(defaults, packageJson[LINK_DEPENDENCIES_CONF_KEY]);
  }
  return defaults;
}

function readAndValidateSettings(cwd) {
  const settings = readSettings(cwd);
  validateSettings(settings);
  return settings;
}

module.exports = {
  readAndValidateSettings
};
