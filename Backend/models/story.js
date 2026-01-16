const mongoose = require("mongoose");

const storyschema = new mongoose.Schema(
    {
      title: String,
     description: String,
    },
  { timestamps: true }
);

module.exports = mongoose.model("Story",storyschema);
