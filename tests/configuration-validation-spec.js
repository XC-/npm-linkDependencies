const path = require("path");

const { readAndValidateSettings } = require("../src/utils/configuration");

describe("Validate configurations", () => {
  const cwd = process.cwd();
  const jsonPath = path.join(cwd, "tests", "dummies", "jsons");

  it("should read valid full configuration successfully", () => {
    const pkgFile = path.join(jsonPath, "validFull");
    expect(readAndValidateSettings(pkgFile)).not.toBeUndefined()
  });

  it("should read valid configuration successfully", () => {
    const pkgFile = path.join(jsonPath, "validDefaults");
    expect(readAndValidateSettings(pkgFile)).not.toBeUndefined()
  });

  describe("should throw error", () => {
    it("when createLink is not boolean", () => {
      const pkgFile = path.join(jsonPath, "wrongAutoOverRideLink");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when createLink is not a boolean", () => {
      const pkgFile = path.join(jsonPath, "wrongCreateLink");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when fallbackToInstall is not a boolean", () => {
      const pkgFile = path.join(jsonPath, "wrongFallbackToInstall");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when installPeerDependencies is not a boolean", () => {
      const pkgFile = path.join(jsonPath, "wrongInstallPeerDependencies");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when dependencies is not an array or object", () => {
      const pkgFile = path.join(jsonPath, "wrongDependencies");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when environmentKey is not string", () => {
      const pkgFile = path.join(jsonPath, "wrongEnvironmentKey");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });

    it("when skipInEnvironments is not an array", () => {
      const pkgFile = path.join(jsonPath, "wrongSkipInEnvironment");
      expect(readAndValidateSettings.bind(null, pkgFile)).toThrow();
    });
  });
});