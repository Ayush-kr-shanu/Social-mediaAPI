const mongoose = require("mongoose");
const { Schema } = mongoose;



const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  posts: [
    { 
        type: Schema.Types.ObjectId, ref: "Post"
    }
],
  friends: [
    {
         type: Schema.Types.ObjectId, ref: "User" 
    }
],
  friendRequests: [
    {
         type: Schema.Types.ObjectId, ref: "User" 
    }
],
});


const UserModel=mongoose.model("User",  userSchema)

module.exports={
    UserModel
}