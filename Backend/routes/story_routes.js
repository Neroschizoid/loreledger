const express = require('express');
const Router = express.Router();
const {createStory,getstories,getstorybyid} = require("../controller/story_controller");
const characterroutes =require("./character_routes")

Router.route("/").get(getstories).post(createStory);
Router.route("/:id").get(getstorybyid);

Router.use("/:storyID/characters",characterroutes);
module.exports=Router;