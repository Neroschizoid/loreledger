const express = require('express');
const Router = express.Router();
const {createStory,getstories,getstorybyid} = require("../controller/story_controller");


Router.route("/").get(getstories).post(createStory);
Router.route("/:id").get(getstorybyid);

module.exports=Router;