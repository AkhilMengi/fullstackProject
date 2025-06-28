
const jwt = require("jsonwebtoken")
const User = require('../models/user');
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Authentication failed: No token provided.");
    }

    const decodedToken = jwt.verify(token, "DEVTINDER_!@##$$");
    const { _id } = decodedToken;

    const user = await User.findById(_id).select("-password");
    if (!user) {
      return res.status(401).send("Authentication failed: User not found.");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).send(`Invalid or expired token: ${err.message}`);
    }
    res.status(500).send(`Error during authentication: ${err.message}`);
  }
};


module.exports = {
    userAuth
};
