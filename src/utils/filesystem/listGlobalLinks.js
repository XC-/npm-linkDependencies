const fs = require("fs");

const { listFiles } = require("./findLDPackages");
const { npmGlobalLibPath } = require("../defaults");


function listGlobalLinks() {
  return listFiles(npmGlobalLibPath()).then((files) => {
    return files.filter((f) => fs.lstatSync(f).isSymbolicLink());
  });
}

module.exports = {
  listGlobalLinks
};
