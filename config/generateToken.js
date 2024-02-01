const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, 'WATCHDOGS426890', {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
