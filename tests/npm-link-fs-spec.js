const path = require("path");
const fsOrig = require("fs");
const fs = require("fs-extra");

const { spawnSync } = require("child_process");
const { getGlobalNodeModulesLocation } = require("../src/utils/link/create");
let npmCmd;

if (process.platform === "win32") {
    npmCmd = "npm.cmd";
} else {
    npmCmd = "npm";
}

const pkgBase = {
  "version": "0.0.1",
  "description": "dummy pkg",
  "main": " ",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
};

describe("Run npm linking", () => {
  const owd = process.cwd();
  const jsonPath = path.join(owd, "tests", "dummies");
  const scriptPath = "../../../src/npm-linkdependencies.js";
  const pkgA = Object.assign({name: "a"}, pkgBase);
  const pkgB = Object.assign({name: "b"}, pkgBase);

  const setup = (pkgPath) => {
    return () => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
      fs.removeSync(path.join(pkgPath, "node_modules"));
      fs.removeSync(path.join(pkgPath, "package-lock.json"));
      if (fs.pathExistsSync(path.join(pkgPath, "node_modules")) || fs.pathExistsSync(path.join(pkgPath, "package-lock.json"))) {
        console.log("Could not clean all files...")
      }
      process.chdir(pkgPath);
    };
  };

  beforeAll(() => {
    process.chdir(path.join(owd, "tests", "dummies", "linkPkgA"));
    const linkA = spawnSync(npmCmd, ["link"]);
    expect(linkA.status).toEqual(0);

    process.chdir(path.join(owd, "tests", "dummies", "linkPkgB"));
    const linkB = spawnSync(npmCmd, ["link"]);
    expect(linkB.status).toEqual(0);

    process.chdir(owd);
  });

  afterAll(() => {
    process.chdir(owd);
    const rmA = spawnSync(npmCmd, ["rm", "--global", "a"]);
    const rmB = spawnSync(npmCmd, ["rm", "--global", "b"]);
    const clearA = fs.removeSync(path.join(owd, "tests", "dummies", "linkPkgA", "package-lock.json"));
    const clearB = fs.removeSync(path.join(owd, "tests", "dummies", "linkPkgB", "package-lock.json"));
    expect(rmA.status).toEqual(0);
    expect(rmB.status).toEqual(0);
  });

  describe("For package c", () => {
    const pkgPath = path.join(jsonPath, "c");

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should have correct pkg b", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgBJson = require(path.join(pkgPath, "node_modules", "b", "package.json"));
      expect(pkgBJson).toEqual(pkgB);
    });
  });

  describe("For package d", () => {
    const pkgPath = path.join(jsonPath, "d");

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should not have package g", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "g"))).toBe(false);
    });

    it("should have installed package async instead of g", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "async"))).toBe(true);
    })
  });

  describe("For package e", () => {
    const pkgPath = path.join(jsonPath, "e");
    const localPkgB = {
      "name": "b-thispackageshouldnotbereplaced",
      "version": "0.0.1",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "",
      "license": "ISC"
    };

    beforeEach(() => {
      setup(pkgPath)();
      fs.copySync(path.join(pkgPath, "..", "templates", "node_modules"), path.join(pkgPath, "node_modules"));
    });
    afterAll(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should have correct pkg b", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgBJson = require(path.join(pkgPath, "node_modules", "b", "package.json"));
      expect(pkgBJson).toEqual(localPkgB);
    });
  });


  describe("For package f", () => {
    const pkgPath = path.join(jsonPath, "f");
    const localPkgB = {
      "name": "b-thispackageshouldnotbereplaced",
      "version": "0.0.1",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "",
      "license": "ISC"
    };

    beforeEach(() => {
      setup(pkgPath)();
      fs.copySync(path.join(pkgPath, "..", "templates", "node_modules"), path.join(pkgPath, "node_modules"));
    });
    afterAll(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should have correct pkg b", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgBJson = require(path.join(pkgPath, "node_modules", "b", "package.json"));
      expect(pkgBJson).toEqual(localPkgB);
    });

    it("should not have package lodash", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "lodash"))).toBe(false);
    });

    it("should not have package async", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "async"))).toBe(false);
    });
  });

  describe("For package h", () => {
    const pkgPath = path.join(jsonPath, "h");

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should not have node_modules", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules"))).toBe(false);
    });
  });

  describe("For package withFallbackInstalledGlobally (same as d but with one package installed globally)", () => {
    const pkgPath = path.join(jsonPath, "withFallbackInstalledGlobally");

    beforeAll(() => {
      const rmA = spawnSync(npmCmd, ["install", "-g", "async"]);
      expect(rmA.status).toEqual(0);
    });

    afterAll(() => {
      process.chdir(owd);
      const rmC = spawnSync(npmCmd, ["rm", "--global", "async"]);
      expect(rmC.status).toEqual(0);
    });

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should not have package g", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "g"))).toBe(false);
    });

    it("should have installed package async instead of g", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "async"))).toBe(true);
    })
  });

 describe("For package withScriptInPostinstall", () => {
    const pkgPath = path.join(jsonPath, "withScriptInPostinstall");

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should have correct pkg b", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const pkgBJson = require(path.join(pkgPath, "node_modules", "b", "package.json"));
      expect(pkgBJson).toEqual(pkgB);
    });

    it("successfully via npm install", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(linkCall.status).toEqual(0);
    });
  });

  describe("For package withScriptInPostinstallAndFallbacks", () => {
    const pkgPath = path.join(jsonPath, "withScriptInPostinstallAndFallbacks");

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(linkCall.status).toEqual(0);
    });

    it("should have correct pkg a", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      const pkgAJson = require(path.join(pkgPath, "node_modules", "a", "package.json"));
      expect(pkgAJson).toEqual(pkgA);
    });

    it("should not have package g", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "g"))).toBe(false);
    });

    it("should have installed package fs-extra instead of g", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "fs-extra"))).toBe(true);
    });

    it("should have installed package async", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(fs.pathExistsSync(path.join(pkgPath, "node_modules", "async"))).toBe(true);
    });

    it("successfully via npm install", () => {
      const linkCall = spawnSync(npmCmd, ["install"]);
      expect(linkCall.status).toEqual(0);
    });
  });

  describe("For package skipInEnvironment", () => {
    const pkgPath = path.join(jsonPath, "skipInEnvironment");
    const env = Object.create(process.env);
    env["MY_ENV"] = "TESTING";

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath], {env});
      expect(linkCall.status).toEqual(0);
    });

    it("should skip most of the script", () => {
      const linkCall = spawnSync("node", [scriptPath], {env});
      const stdout = linkCall.stdout.toString().trim();
      expect(stdout.indexOf("Detected an environment that should be skipped.")).not.toEqual(-1);
    });
  });

  describe("For package skipInEnvironmentDoesNotMatch", () => {
    const pkgPath = path.join(jsonPath, "skipInEnvironmentDoesNotMatch");
    const env = Object.create(process.env);
    env["MY_ENV"] = "DEVELOPMENT";

    beforeEach(setup(pkgPath));
    afterEach(setup(pkgPath));

    it("successfully", () => {
      const linkCall = spawnSync("node", [scriptPath], {env});
      expect(linkCall.status).toEqual(0);
    });

    it("should not skip most of the script when the env variable is set but not in the skiplist", () => {
      const linkCall = spawnSync("node", [scriptPath], {env});
      const stdout = linkCall.stdout.toString().trim();
      expect(stdout.indexOf("Detected an environment that should be skipped.")).toEqual(-1);
    });

    it("should not skip most of the script when the env variable is not set", () => {
      const linkCall = spawnSync("node", [scriptPath]);
      const stdout = linkCall.stdout.toString().trim();
      expect(stdout.indexOf("Detected an environment that should be skipped.")).toEqual(-1);
    });
  });
});
