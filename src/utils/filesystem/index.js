const fs = require("fs");

const { listGlobalLinks } = require("./listGlobalLinks");

function exists(path, cb) {
  fs.lstat(path, (err, stat) => {
    if (err) {
      switch (err.code) {
        case "ENOENT":
          cb(false);
          break;
        default:
          throw err;
      }
    }
    cb(true);
  });
}

function lstat(path) {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

function symlink(target, linkName, type) {
  return new Promise((resolve, reject) => {
    fs.symlink(target, linkName, type, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  exists,
  lstat,
  symlink,

  listGlobalLinks
};
