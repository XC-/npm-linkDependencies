const fs = require("fs");
const path = require("path");

const { LD_FIELD } = require("../defaults");

function listFilesSync(directory) {
  return fs.readdirSync(directory).reduce((agg, file) => {
    const fileWithPath = path.join(directory, file);
    if (file !== "node_modules" && !file.startsWith(".")) {
      if (fs.lstatSync(fileWithPath).isDirectory()) {
        return agg.concat(listFilesSync(fileWithPath));
      } else {
        agg.push(fileWithPath);
        return agg;
      }
    }
    return agg;
  }, []);
}

function listFiles(directory) {
  return Promise.resolve(listFilesSync(directory));
}

function listPackages(directory) {
  return listFiles(directory).then((files) => files.filter((f) => path.parse(f).base === "package.json"));
}

function listLinkDependenciesPackages(directory) {
  return listPackages(directory).then((files) => {
    return files.filter((f) => {
      const pkg = require(f);
      return pkg.hasOwnProperty(LD_FIELD);
    });
  })
}

module.exports = {
  listFilesSync,
  listFiles,
  listLinkDependenciesPackages
};