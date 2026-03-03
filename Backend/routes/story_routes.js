const express = require('express');
const Router = express.Router();
const { createStory, getstories, getstorybyid } = require("../controller/story_controller");
const characterroutes = require("./character_routes")
const authMiddleware = require("../middlewares/authmiddleware")
const actionroutes = require("./action_routes")
const {
  getStoriesSchema,
  getStoryByIdSchema,
  createStorySchema
} = require("../validators/story_validator")
const validate = require("../middlewares/validator")


Router.route("/").get(validate(getStoriesSchema), getstories).post(authMiddleware, validate(createStorySchema), createStory);
Router.route("/:id").get(validate(getStoryByIdSchema), getstorybyid);

Router.use("/:storyID/characters", characterroutes);
Router.use("/:storyID/", actionroutes);
module.exports = Router;