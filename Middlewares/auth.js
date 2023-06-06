const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/User.model");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).send({ msg: "Login again session expired" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_CODE);
    const { userId } = decodeToken;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).send({ msg: "Unauthorized" });
  }
};

module.exports = {
  authenticate,
};
