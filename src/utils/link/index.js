const { arrayLink } = require("./arrayLink");
const { objectLink } = require("./objectLink");
const { checkIfInitialLinkExists } = require("./initialExists");
const { createLink } = require("./create");
const { removeLink } = require("./remove");

module.exports = {
  arrayLink,
  createLink,
  checkIfInitialLinkExists,
  objectLink,
  removeLink
};
