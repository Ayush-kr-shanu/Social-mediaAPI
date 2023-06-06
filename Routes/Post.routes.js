const express = require("express");
const { authenticate } = require("../Middlewares/auth");
const { PostModel } = require("../Models/Post.model");

const postRoute = express.Router();

postRoute.get("/posts", async (req, res) => {
    try {
      const posts = await PostModel.find();
      res.send(posts);
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});


postRoute.post("/posts", authenticate, async (req, res) => {
    try {
      const { text, image } = req.body;
      const userId = req.user._id;
  
      const newPost = new PostModel({
        text,
        image,
        userId,
      });
  
      await newPost.save();
  
      res.send({ message: "Post created successfully", post: newPost });
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});

postRoute.put("/posts/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { text, image } = req.body;
  
      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).send({ msg: "Post not found" });
      }
  
      if (post.userId !== req.user._id) {
        return res.status(403).send({ msg: "You are not authorized to update this post" });
      }
  
      post.text = text;
      post.image = image;
  
      await post.save();
  
      res.send({ message: "Post updated successfully", post });
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});
  
  // Delete a post
postRoute.delete("/posts/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
  
      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).send({ msg: "Post not found" });
      }
  
      if (post.userId !== req.user._id) {
        return res.status(403).send({ msg: "You are not authorized to delete this post" });
      }
  
      await post.remove();
  
      res.send({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
});


//like the post
postRoute.put("/posts/:id/like", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(user._id);
    if (isLiked) {
      return res.status(400).send({ error: "Post already liked"});
    }

    post.likes.push(user._id);
    await post.save();

    res.send({ message: "Post liked successfully", like:likes });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
});

//comments on post
postRoute.post("/posts/:id/comment", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { text } = req.body;

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    const newComment = {
      user: user._id,
      text: text,
      createdAt: new Date().toISOString(),
    };

    post.comments.push(newComment);
    await post.save();

    res.send({ message: "Comment added successfully", comment: newComment });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
});

//get post
postRoute.get("/posts/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id)
      .populate("user", "name")
      .populate("likes", "name")
      .populate("comments.user", "name");

    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    res.send({ post });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
});


module.exports = {
    postRoute,
};
