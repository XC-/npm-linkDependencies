#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const { listGlobalLinks } = require("./utils/filesystem");
const exit = require("./utils/process").exit;

listGlobalLinks().then((files) => {
  console.log("Found the following linked packages:");
  let longest = 0;
  files.forEach((f) => {
    longest = f.length > longest ? f.length : longest;
  });
  files.forEach((f) =>  {
    console.log(`${path.parse(f).base}${" ".repeat(longest - f.length)}  -->  ${fs.readlinkSync(f)}`);
  });
  exit.success();
}).catch((err) => {
  exit.genericError(err);
});