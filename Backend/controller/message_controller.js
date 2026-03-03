const Message = require("../models/message");
const Story = require("../models/story");

/**
 * Get all messages for a specific story (only accessible by story participants)
 * We assume `req.user` refers to the logged-in user.
 */
exports.getStoryMessages = async (req, res, next) => {
    try {
        const { storyId } = req.params;

        // Validate story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        // Optional: Add logic here to verify if `req.user.id` is part of the story (author or character)

        // Fetch messages for the room
        const messages = await Message.find({ storyId })
            .populate("senderId", "username")
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (error) {
        next(error);
    }
};
