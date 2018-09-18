const path = require("path");
const fs = require("fs");

const { spawnSync } = require("child_process");

const defaults = require("./defaults.json");

const LINK_DEPENDENCIES_CONF_KEY = "linkDependencies";

function throwTypeError(value, expected, got) {
  throw TypeError(`${value} has invalid type. Expected: ${expected}. Got: {got}`);
}

function printHeader() {
  console.log(`
    |***********************************************************************|
    |                        npm-linkDependencies                           |
    |                         Aki Mäkinen (2018)                            |
    |             https://github.com/XC-/npm-linkDependencies               |
    |***********************************************************************|
  `)
}


function verifySettings(settings) {
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      switch (key) {
        case "installPeerDependencies":
          if (typeof settings[key] !== "boolean") {
            throwTypeError(key, "boolean", typeof settings[key]);
          }
          break;
        case "fallbackToInstall":
          if (typeof settings[key] !== "boolean") {
            throwTypeError(key, "boolean", typeof settings[key]);
          }
          break;
        case "dependencies":
          if (settings[key]) {
            if (Array.isArray(settings[key])) {
              if (settings.fallbackToInstall === true) {
                throw Error("Dependencies cannot be defined as an array when fallbackToInstall is set true.")
              }
              for (const entry in settings[key]) {
                if (typeof entry !== "string") {
                  throwTypeError(entry, "string", typeof entry);
                }
              }
            } else if (typeof settings[key] === "object") {
              for (const depKey in settings[key]) {
                if (settings[key].hasOwnProperty(depKey)) {
                  if (typeof depKey !== "string" || typeof settings[key][depKey] !== "string") {
                    throwTypeError(depKey, "string", typeof settings[key][depKey]);
                  }
                }
              }
            } else {
              throwTypeError(key, "array or {}", typeof settings[key]);
            }
          }
          break;
        default:
          console.log(`Unknown option ${key}, ignoring.`);
          break;
      }
    }
  }
}

function readSettings(dir) {
  const packageJson = require(path.join(dir, "package.json"));

  if (Object.keys(packageJson).indexOf(LINK_DEPENDENCIES_CONF_KEY) > -1) {
    return Object.assign(defaults, packageJson[LINK_DEPENDENCIES_CONF_KEY]);
  }
  return defaults;
}

function arrayLink(linkableModules, cwd) {
  const successes = linkableModules.reduce((acc, item) => {
    console.log(`Linking ${item}`);
    const call = spawnSync("npm", ["link", item], {cwd});

    if (call.status === 0) {
      console.log("Linking successful!");
      return acc.concat([item]);
    } else {
      console.log(`Npm link for ${item} failed with messages: `);
      console.log(call.stdout.toString());
      console.log(call.stderr.toString());
    }
    return acc;
  }, []);

  if (successes.length !== linkableModules.length) {
    console.log("Linking failed for some packages, starting rollback");
    console.log("Rollback disabled temporarily because npm unlink == npm uninstall.");
    console.log("Please remove extra links and packages manually.");
    // const rbSuccesses = successes.reduce((acc, item) => {
    //   const call = spawnSync("npm", ["unlink", item], {cwd});
    //   if (call.status === 0) {
    //     return acc.concat([item]);
    //   } else {
    //     console.log(`Npm link for ${item} has failed with messages: `);
    //     console.log(call.stdout.toString());
    //     console.log(call.stderr.toString());
    //     console.log("This link has to be removed manually");
    //   }
    //   return acc;
    // }, []);
    //
    // if (rbSuccesses.length !== successes.length) {
    //   console.log("Rollback was successful only partially. Following modules have to be removed manually:");
    //   console.log(successes.length.filter((item) => rbSuccesses.indexOf(item) === -1));
    //   process.exit(1);
    // }
  } else {
    console.log("All modules linked successfully!")
  }
}

function objectLink(linkableModuleKeys, dependencies, cwd, fallBackToInstall) {
  const canBeLinked = linkableModuleKeys.reduce((acc, item) => {
    const linkCall = spawnSync("npm", ["link", item], {cwd});
    if (linkCall.status === 0) {
      return acc.concat([item]);
    }
    return acc;
  }, []);

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
          console.log(`npm install of package ${item} failed with messages: `);
          console.log(installCall.stdout.toString());
          console.log(installCall.stderr.toString());
        }
        return acc;
      }, []);

      if (installSuccesses.length !== mustBeInstalled.length) {
        console.log("npm install failed for the following packages: ");
        console.log(mustBeInstalled.filter((item) => installSuccesses.indexOf(item) === -1).join(", "));
        console.log("Exiting");
        process.exit(1);
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
      console.log("npm link succeeded only partially. Automatic rollback not yet implemented. Manual rollback required for the packages: ");
      console.log(successes.join(", "));
      process.exit(1);
    } else {
      console.log("All modules linked successfully!");
    }
  }
}


if (require.main === module) {
  printHeader();
  const cwd = process.cwd();
  const settings = readSettings(cwd);
  try {
    verifySettings(settings);
  } catch (e) {
    console.log("Failed to verify settings.");
    console.log(e.message);
  }

  if (settings.installPeerDependencies === true) {
    console.log("installPeerDependencies is set to true. Unfortunately this is not yet implemented.");
  }

  console.log("Starting npm linking...");

  const installedModules = fs.readdirSync(path.join(cwd, "node_modules"));
  const moduleReducer = (acc, item) => {
    if (installedModules.indexOf(item) === -1) {
      return acc.concat([item]);
    }
    return acc;
  };

  if (settings.fallbackToInstall === true) {
    const linkableModuleKeys = Object.keys(settings.dependencies).reduce(moduleReducer, []);

    if (linkableModuleKeys.length > 0) {
      objectLink(linkableModuleKeys, settings.dependencies, cwd, settings.fallbackToInstall);
    } else {
      console.log("Nothing to link or install :(")
    }
  } else {
    const linkableModules = settings.dependencies.reduce(moduleReducer, []);

    if (linkableModules.length > 0) {
      arrayLink(linkableModules, cwd);
    } else {
      console.log("Nothing to link :(");
    }
  }

  console.log("Npm linking done!");
  process.exit(0);

} else {
  console.log("Importing as a library is not supported by this package.");
  process.exit(1);
}