function exitWithCode(code) {
  return (message) => {
    if (message) {
      if (code === 0) {
        console.log(message);
      } else {
        console.error(message);
      }
    }
    console.log("Exiting link-dependencies...");
    process.exit(code);
  }
}

module.exports = {
  npmLInkError: exitWithCode(5),
  npmInstallError: exitWithCode(4),
  initialNpmLinkError: exitWithCode(3),
  configurationValidationError: exitWithCode(2),
  genericError: exitWithCode(1),
  success: exitWithCode(0)
};
