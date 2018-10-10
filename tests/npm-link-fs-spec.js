const path = require("path");
const fs = require("fs-extra");

const { spawnSync } = require("child_process");

const { readAndValidateSettings } = require("../src/utils/configuration");

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
      fs.removeSync(path.join(pkgPath, "node_modules"));
      fs.removeSync(path.join(pkgPath, "package-lock.json"));
      if (fs.pathExistsSync(path.join(pkgPath, "node_modules")) || fs.pathExistsSync(path.join(pkgPath, "package-lock.json"))) {
        console.log("Could not clean all files...")
      }
      process.chdir(pkgPath);
    };
  };

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
      fs.copySync(path.join(pkgPath, "..", "templates", "node_modules"), path.join(pkgPath));
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
      fs.copySync(path.join(pkgPath, "..", "templates", "node_modules"), path.join(pkgPath));
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

});
