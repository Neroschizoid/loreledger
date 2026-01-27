const mongoose = require("mongoose");

const storyschema = new mongoose.Schema(
    {
      title: {
      type: String,
      required: true,
    },
     description: String,
     authorId:{
       type:mongoose.Schema.ObjectId,
        ref:"User",
        required: true,
    }
    },
  { timestamps: true }
);

module.exports = mongoose.model("Story",storyschema);
