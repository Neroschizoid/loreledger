const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        storyId: {
            type: mongoose.Schema.ObjectId,
            ref: "Story",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
