const path = require("path");
const fs = require("fs");

const { spawnSync } = require("child_process");

const { readAndValidateSettings } = require("./utils/configuration");
const exitProcess = require("./utils/process");

function printHeader() {
  console.log(`
    |***********************************************************************|
    |                        npm-linkDependencies                           |
    |                         Aki Mäkinen (2018)                            |
    |             https://github.com/XC-/npm-linkDependencies               |
    |***********************************************************************|
  `)
}

function checkIfInitialLinkExists(pkg) {
  const npmPrefix = spawnSync("npm", ["prefix", "-g"]).stdout.toString().trim();
  const libPath = path.join(npmPrefix, "lib", "node_modules", pkg);
  return fs.existsSync(libPath) && fs.lstatSync(libPath).isSymbolicLink();
}

function arrayLink(linkableModules, cwd) {
  const successes = linkableModules.reduce((acc, item) => {
    console.log(`Linking ${item}`);

    if (checkIfInitialLinkExists(item)) {
      const call = spawnSync("npm", ["link", item], {cwd});

      if (call.status === 0) {
        console.log("Linking successful!");
        return acc.concat([item]);
      } else {
        console.log(`Npm link for ${item} failed with messages: `);
        console.log(call.stdout.toString());
        console.log(call.stderr.toString());
      }
    } else {
      console.log(`Could not find link from global lib folder. Skipping...`);
    }

    return acc;
  }, []);

  console.log("Linked packages: ");
  console.log(successes);

  if (successes.length !== linkableModules.length) {
    exitProcess.npmLInkError("Linking failed for some packages...");

  } else {
    console.log("All modules linked successfully!")
  }
}

function objectLink(linkableModuleKeys, dependencies, cwd, fallBackToInstall) {
  const canBeLinked = linkableModuleKeys;

  if (fallBackToInstall) {
    console.log("Running install for packages that cannot be linked");
    const mustBeInstalled = linkableModuleKeys.filter((item) => canBeLinked.indexOf(item) === -1);
    if (mustBeInstalled.length > 0) {
      const installSuccesses = mustBeInstalled.reduce((acc, item) => {
        console.log(`Running install for ${item} (${dependencies[item]})`);
        const installCall = spawnSync("npm", ["install", dependencies[item]], {cwd});
        if (installCall.status === 0) {
          return acc.concat([item]);
        } else {
          console.error(`npm install of package ${item} failed with messages: `);
          console.error(installCall.stdout.toString());
          console.error(installCall.stderr.toString());
        }
        return acc;
      }, []);

      if (installSuccesses.length !== mustBeInstalled.length) {
        console.log("npm install failed for the following packages: ");
        console.log(mustBeInstalled.filter((item) => installSuccesses.indexOf(item) === -1).join(", "));
        exitProcess.npmInstallError();
      } else {
        console.log("npm install complete!");
      }
    }
  }

  console.log("Running npm link for the packages...");
  if (canBeLinked.length > 0) {
    const linkingSuccesses = canBeLinked.reduce((acc, item) => {
      console.log(`Running npm link for ${item}`);
      const linkCall = spawnSync("npm", ["link", item], {cwd});
      if (linkCall.status === 0) {
        return acc.concat([item]);
      } else {
        console.log(`npm link failed with messages: `);
        console.log(linkCall.stdout.toString());
        console.log(linkCall.stderr.toString());
      }
      return acc;
    }, []);

    if (linkingSuccesses.length !== canBeLinked.length) {
      console.error("npm link succeeded only partially. Automatic rollback not yet implemented. Manual rollback required for the packages: ");
      exitProcess.npmLinkError(successes.join(", "));
    } else {
      console.log("All modules linked successfully!");
    }
  }
}


if (require.main === module) {
  printHeader();
  const cwd = process.cwd();
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

  if (settings.installPeerDependencies === true) {
    console.log("installPeerDependencies is set to true. Unfortunately this is not yet implemented.");
  }

  if (settings.createLink === true) {
    const createLinkCall = spawnSync("npm",["link"], {cwd});
    if (createLinkCall.status === 0) {
      console.log("Created initial npm link for the package successfully...")
    } else {
      console.error("Failed to create the initial npm link.");
      console.error(createLinkCall.stdout.toString());
      console.error(createLinkCall.stderr.toString());
      exitProcess.initialNpmLinkError();
    }
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
      console.log("fallbackToInstall is not supported when dependencies are defined as an array. Ignoring the configuration...");
    }
    const linkableModules = settings.dependencies.reduce(moduleReducer, []);

    if (linkableModules.length > 0) {
      arrayLink(linkableModules, cwd);
    } else {
      console.log("Nothing to link :'(");
    }
  } else {
    const linkableModuleKeys = Object.keys(settings.dependencies).reduce(moduleReducer, []);

    if (linkableModuleKeys.length > 0) {
      objectLink(linkableModuleKeys, settings.dependencies, cwd, settings.fallbackToInstall);
    } else {
      console.log("Nothing to link or install :'(")
    }
  }

  exitProcess.success("Npm linking done!");

} else {
  exitProcess.genericError("Importing as a library is not supported by this package.");
}