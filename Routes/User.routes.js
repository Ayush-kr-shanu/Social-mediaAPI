const express = require("express");
const mongoose=require("mongoose")
const bcrypt = require("bcrypt");
const { UserModel } = require("../Models/User.model");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../Middlewares/auth");

const userRoute = express.Router();
require("dotenv").config();

userRoute.get("/user", authenticate, async (req, res) => {
  try {
    const user = await UserModel.find();

    res.send(user);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

userRoute.post("/register", async (req, res) => {
  try {
    const { name, email, password, dob, bio } = req.body;

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      res
        .status(401)
        .send({ msg: `This emailId ${email} is already registered` });
    }
    const salt = await bcrypt.genSalt(5);
    const hashed = await bcrypt.hash(password, salt);
    const user = new UserModel({ name, email, password: hashed, dob, bio });
    user.save();

    res.status(200).send({ msg: "User registered sucessfull", user });
  } catch (err) {
    res
      .status(500)
      .send({ msg: "Error in registering user", err: err.message });
  }
});

userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).send({ msg: "Inavalid email or password" });
    }

    const matchPass = await bcrypt.compare(password, user.password);

    if (!matchPass) {
      res.status(401).send({ msg: "Inavalid email or password" });
    }

    const acessToken = jwt.sign({ userId: user._id }, process.env.JWT_CODE, {
      expiresIn: "1h",
    });

    res.status(200).send({ user: user, acessToken });
  } catch (err) {
    res.send({ msg: "something went wrong", error: err.message });
  }
});

userRoute.get("/users/friends", authenticate, async (req, res) => {
    try {
      const { user } = req;
  
      const authenticatedUser = await UserModel.findById(user._id).populate("friends", "name email");
  
      if (!authenticatedUser) {
        return res.status(404).send({ msg: "User not found" });
      }
  
      res.send(authenticatedUser.friends);
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});

userRoute.post("/users/:id/friends", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).send({ msg: "User not found" });
    }

    const isAlreadyRequested = targetUser.friendRequests.includes(user._id);
    if (isAlreadyRequested) {
      return res.status(400).send({ error: "Friend request already sent" });
    }

    targetUser.friendRequests.push(user._id);
    await targetUser.save();

    res.send({ message: "Friend request sent successfully" });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", err: err.message });
  }
});
  
userRoute.put("/users/:id/friends/:friendId", authenticate, async (req, res) => {
    try {
      const { id, friendId } = req.params;
      const { user } = req;
  
      const targetUser = await UserModel.findById(id);
      if (!targetUser) {
        return res.status(404).send({ msg: "User not found" });
      }
  
      const friendRequestId =new mongoose.Types.ObjectId(friendId); // Convert friendId to ObjectId
  
      const friendRequestIndex = targetUser.friendRequests.findIndex(
        (request) => request.equals(friendRequestId) // Use the equals method to compare ObjectId values
      );
      if (friendRequestIndex === -1) {
        return res.status(404).send({ msg: "Friend request not found" });
      }
  
      targetUser.friendRequests.splice(friendRequestIndex, 1);
  
      const { status } = req.body;
      if (status === "accept") {
        targetUser.friends.push(friendId);
  
        const friend = await UserModel.findById(friendId);
        if (!friend) {
          return res.status(404).send({ msg: "Friend not found" });
        }
        friend.friends.push(id);
  
        await friend.save();
      }
  
      await targetUser.save();
  
      res.send({ message: "Friend request handled successfully" });
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});
  

module.exports = {
  userRoute,
};
