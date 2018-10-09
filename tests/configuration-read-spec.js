const path = require("path");
const fs = require("fs");

const { spawnSync } = require("child_process");

const { readAndValidateSettings } = require("../src/utils/configuration");

describe("Validate configurations", () => {
  const cwd = process.cwd();
  const jsonPath = path.join(cwd, "tests", "dummies", "jsons");

  it("should read valid configuration successfully", () => {
    const pkgFile = path.join(jsonPath, "validDefaults");
    expect(readAndValidateSettings(pkgFile)).toEqual(jasmine.objectContaining({
      "fallbackToInstall": false,
      "createLink": false,
      "installPeerDependencies": false
    }));
  });

  it("should return correct full configuration", () => {
    const pkgFile = path.join(jsonPath, "validFull");
    expect(readAndValidateSettings(pkgFile)).toEqual(jasmine.objectContaining({
      "fallbackToInstall": true,
      "createLink": true,
      "installPeerDependencies": true
    }));
  });

  it("should read dependencies correctly when in an array", () => {
    const pkgFile = path.join(jsonPath, "validArray");
    expect(readAndValidateSettings(pkgFile)).toEqual(jasmine.objectContaining({
      "dependencies": ["a", "b"]
    }));
  });

  it("should read dependencies correctly when in an object", () => {
    const pkgFile = path.join(jsonPath, "validObject");
    expect(readAndValidateSettings(pkgFile)).toEqual(jasmine.objectContaining({
      "dependencies": {
        "a": "lodash",
        "b": "async"
      }
    }));
  });
});