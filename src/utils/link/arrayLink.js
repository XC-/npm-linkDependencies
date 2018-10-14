const { spawnSync } = require("child_process");

const processUtils = require("../process");
const exitProcess = processUtils.exit;

const {checkIfInitialLinkExists} = require("./initialExists");
const { npmCmd } = require("../defaults");

function arrayLink(linkableModules, cwd) {
  return Promise
    .resolve(linkableModules.reduce(
      (acc, item) => {
        console.log(`Linking ${item}`);

        if (checkIfInitialLinkExists(item)) {
          const call = spawnSync(npmCmd, ["link", item], {cwd});

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
      }, []))
    .then((successes) => {
      console.log("Linked packages: ");
      console.log(successes);

      if (successes.length !== linkableModules.length) {
        exitProcess.npmLinkError("Linking failed for some packages...");
      } else {
        console.log("All modules linked successfully!")
      }
      return successes;
    })
}

module.exports = {
  arrayLink
};
