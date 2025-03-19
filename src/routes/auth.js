const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validations.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

//signup api
authRouter.post("/signup", async (req, res) => {
  // creating a new instance of a user model

  try {
    //validating the data
    validateSignupData(req);

    //encrypting the password
    //using npm i bcrypt
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const userdata = await user.save();
    const token = await userdata.getJWT();
    res.cookie("token", token);

    res.json({ message: "user added  successfully", data: userdata });
  } catch (err) {
    res.status(400).send("error saving user " + err.message);
  }
});

//login api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("invalid credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token);
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("error saving user " + err.message);
  }
});

//logout

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("user logout succesfully");
});

module.exports = authRouter;
