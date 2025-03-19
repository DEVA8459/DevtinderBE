const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //Read the token from the req cookies
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("please login")
    }
    // validate the token

    const decodedMsg = await jwt.verify(token, "deva@7894" ,);
    const { _id } = decodedMsg;

    // find the user

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }
    req.user =user
    next();
  } catch (error) {
    res.status(400).send("error fetching user " + error.message);
  }
};

module.exports = {
  userAuth,
};
