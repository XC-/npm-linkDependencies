const path = require("path");
const fs = require("fs");

const { readAndValidateSettings } = require("./utils/configuration");
const { createLink, arrayLink, objectLink, checkIfInitialLinkExists } = require("./utils/link");
const { exists } = require("./utils/filesystem");
const exitProcess = require("./utils/process").exit;

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});

function printHeader() {
  console.log(`
    |***********************************************************************|
    |                        npm-linkDependencies                           |
    |                         Aki Mäkinen (2018)                            |
    |             https://github.com/XC-/npm-linkDependencies               |
    |***********************************************************************|
  `)
}

if (require.main === module) {
  printHeader();
  const cwd = process.cwd();
  let chain = Promise.resolve();
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  READ AND VALIDATE SETTINGS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  let settings = {};
  try {
    settings = readAndValidateSettings(cwd);
  } catch(e) {
    if (e instanceof TypeError) {
      console.error("Error when validating the configuration: ");
      console.error(e.message);

      exitProcess.configurationValidationError();
    } else {
      exitProcess.genericError(e);
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  INSTALL PEER DEPENDENCIES (TODO)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (settings.installPeerDependencies === true) {
    console.log("installPeerDependencies is set to true. Unfortunately this is not yet implemented.");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  CREATE LINK TO PROJECT
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  chain = chain
    .then(() => {
      if (settings.createLink === true) {
      try {
        const packageJson = require(path.join(cwd, "package.json"));
        return createLink(packageJson.name, cwd, settings.autoOverrideLink);
      } catch(e) {
        exitProcess.npmLinkError(e.message);
        }
      }
    })
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  DO THE LINKING
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    .then(() => {
      if (!settings.dependencies) {
        exitProcess.success("Nothing to do...");
      }

      console.log("Starting npm linking...");
      const modulePath = path.join(cwd, "node_modules");
      let installedModules = [];
      if (fs.existsSync(modulePath)) {
        installedModules = fs.readdirSync(modulePath);
      }

      const moduleReducer = (acc, item) => {
        if (installedModules.indexOf(item) === -1 && checkIfInitialLinkExists(item)) {
          return acc.concat([item]);
        }
        return acc;
      };

      if (Array.isArray(settings.dependencies)) {
        if (settings.fallbackToInstall === true) {
          console.log("fallbackToInstall is not supported when dependencies are defined as an array. Ignoring the configuration...\n\r");
        }
        const linkableModules = settings.dependencies.reduce(moduleReducer, []);
        if (linkableModules.length > 0) {
          return arrayLink(linkableModules, cwd);
        } else {
          console.log("Nothing to link...");
        }
      } else {
        const linkableModuleKeys = Object.keys(settings.dependencies).reduce(moduleReducer, []);

        if (linkableModuleKeys.length > 0) {
          return objectLink(linkableModuleKeys, settings.dependencies, cwd, settings.fallbackToInstall);
        } else {
          console.log("Nothing to link or install...")
        }
      }
    })
    .then(() => {
      exitProcess.success("Npm linking done!");
    });
} else {
  exitProcess.genericError("Importing as a library is not supported by this package.");
}