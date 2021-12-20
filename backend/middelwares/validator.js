const { body, validationResult } = require("express-validator");
const registerRules = [
  body("name", "name is required").notEmpty(),
  body("email", "enter a valid email").isEmail(),
  body("password", "password at least 6 caracters").isLength({ min: 6 }),
];
const loginRules = [
  body("email", "enter a valid email").isEmail(),
  body("password", "password at least 6 caracters").isLength({ min: 6 }),
];
const validator = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).send({ errors: error.array() });
  }
  next();
};
module.exports = { registerRules, validator, loginRules };
