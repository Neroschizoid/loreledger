const mongoose = require("mongoose");

const STATUS_TYPE = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
};

const actionRequestSchema = new mongoose.Schema(
    {
        actionId: {
            type: mongoose.Schema.ObjectId,
            ref: "Action",
            required: true,
        },
        storyId: {
            type: mongoose.Schema.ObjectId,
            ref: "Story",
            required: true,
        },
        characterId: {
            type: mongoose.Schema.ObjectId,
            ref: "Character",
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(STATUS_TYPE),
            default: STATUS_TYPE.PENDING
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ActionRequest", actionRequestSchema);
