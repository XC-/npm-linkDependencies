const { spawnSync } = require("child_process");

const processUtils = require("../process");
const exitProcess = processUtils.exit;

const { npmCmd } = require("../defaults");

function objectLink(linkableModuleKeys, dependencies, cwd, fallBackToInstall) {
  const canBeLinked = linkableModuleKeys;
  return Promise
    .resolve(Object.keys(dependencies).filter((item) => canBeLinked.indexOf(item) === -1))
    .then((mustBeInstalled) => {
      console.log(mustBeInstalled);
      if (fallBackToInstall) {
        console.log(`Running install for packages that cannot be linked: ${mustBeInstalled}`);

        if (mustBeInstalled.length > 0) {
          const installSuccesses = mustBeInstalled.reduce((acc, item) => {
            console.log(`Running install for ${item} (${dependencies[item]})`);
            const installCall = spawnSync(npmCmd, ["install", dependencies[item], "--no-save"], {cwd});
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
    })
    .then(() => {
      console.log("Running npm link for the packages...");
      if (canBeLinked.length > 0) {
        const linkingSuccesses = canBeLinked.reduce((acc, item) => {
          console.log(`Running npm link for ${item}`);
          const linkCall = spawnSync(npmCmd, ["link", item], {cwd});
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
    });
}

module.exports = {
  objectLink
};
