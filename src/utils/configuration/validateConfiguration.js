function throwTypeError(value, expected, got) {
  throw new TypeError(`${value} has invalid type. Expected: ${expected}. Got: ${got}`);
}

function validateValue(expected) {
  return (got, name) => {
    if (typeof got !== expected) {
      throwTypeError(name, expected, got);
    }
  }
}

const validators = {
  bool: validateValue("boolean"),
  str: validateValue("string")
};

function validateSettings(settings) {
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      switch (key) {
        case "autoOverrideLink":
        case "installPeerDependencies":
        case "fallbackToInstall":
        case "createLink":
          validators.bool(settings[key], key);
          break;
        case "dependencies":
          if (settings[key]) {
            if (Array.isArray(settings[key])) {
              for (const entry in settings[key]) {
                validators.str(entry, entry)
              }
            } else if (typeof settings[key] === "object") {
              for (const depKey in settings[key]) {
                if (settings[key].hasOwnProperty(depKey)) {
                  validators.str(depKey, depKey);
                  validators.str(settings[key][depKey], depKey);
                }
              }
            } else {
              throwTypeError(key, "array or {}", typeof settings[key]);
            }
          }
          break;
        default:
          console.log(`Unknown option ${key}, ignoring.`);
          break;
      }
    }
  }
}

module.exports = {
  validateSettings
};