const express = require("express");
const User = require("../models/User");
const router = express.Router();
const {
  validator,
  registerRules,
  loginRules,
} = require("../middelwares/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuth = require("../middelwares/isAuth");
//test

router.get("/test", (req, res) => {
  res.send("test ok ");
});

// url api/auth/signup
// method post
// req.body

router.post("/signup", [registerRules, validator], async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check user exist
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).send({ errors: [{ msg: "email is already exist " }] });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    // hash password
    const salt = 10;
    const hashPassword = await bcrypt.hash(password, salt);
    newUser.password = hashPassword;
    await newUser.save();

    // token
    const payload = {
      id: newUser._id,
    };
    const token = jwt.sign(payload, process.env.mySecret, { expiresIn: "7d" });
    res.send({ newUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).send("server error ");
  }
});

// url /api/auth/signin
//method post
// req.body

router.post("/signin", [loginRules, validator], async (req, res) => {
  const { email, password } = req.body;
  try {
    //check user exist

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ errors: [{ msg: "user not found " }] });
    }
    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ errors: [{ msg: "user not found " }] });
    }

    //token
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, process.env.mySecret, {
      expiresIn: "7d",
    });
    res.send({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).send("server error ");
  }
});

// url api/auth/current
//method get
//req.headers
router.get("/current", isAuth, async (req, res) => {
  console.log(req.user);
  try {
    const user = await User.findById(req.user.id);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error ");
  }
});

module.exports = router;
