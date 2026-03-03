const express = require("express");
const router = express.Router();
const { getStoryMessages } = require("../controller/message_controller");
const isauth = require("../middlewares/authmiddleware");

// Fetch chat history for a story. Requires authentication.
router.route("/:storyId").get(isauth, getStoryMessages);

module.exports = router;
