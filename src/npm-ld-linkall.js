#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const { listLinkDependenciesPackages } = require("./utils/filesystem");
const { createLink } = require("./utils/link");
const exit = require("./utils/process").exit;


listLinkDependenciesPackages(process.cwd()).then((files) => {
  return files.filter((f) => {
    const pkg = require(f);
    return pkg.linkDependencies.hasOwnProperty("createLink") && pkg.linkDependencies.createLink === true;
  });
}).then((files) => {
  let promises = files.map((f) => {
    const pkg = require(f);
    console.log(`Linking: ${pkg.name}  --> ${path.parse(f).dir}`);
    return createLink(
      pkg.name,
      path.parse(f).dir,
      pkg.linkDependencies.hasOwnProperty("autoOverrideLink") ? pkg.linkDependencies.autoOverrideLink : true
    );
  });
  return Promise.all(promises);
}).then(() => {
  exit.success("All linked!")
}).catch((err) => {
  exit.genericError(err);
});