const mongoose = require("mongoose");

const userschema = new mongoose.Schema(
    {
    name: String,
    email: String
    },
  { timestamps: true }
);

module.exports = mongoose.model("User",userschema);
