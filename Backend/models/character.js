const mongoose = require("mongoose");

const characteschema = mongoose.Schema(
  {
    name: String,
    race: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, default: 'Commoner' },
    personalities: [{ type: String }],
    storyId: {
      type: mongoose.Schema.ObjectId,
      ref: "Story",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    isAuthorCreated: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
)

characteschema.index(
  { storyId: 1, ownerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isAuthorCreated: false
    }
  }
)

module.exports = mongoose.model("Character", characteschema);