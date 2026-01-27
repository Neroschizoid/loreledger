const express = require('express');
const Router = express.Router();
const {createStory,getstories,getstorybyid} = require("../controller/story_controller");
const characterroutes =require("./character_routes")
const authMiddleware=require("../middlewares/authmiddleware")
const allowRoles=require("../middlewares/rolemiddleware")
const actionroutes=require("./action_routes")


Router.route("/").get(getstories).post(authMiddleware,allowRoles("AUTHOR"),createStory);
Router.route("/:id").get(getstorybyid);

Router.use("/:storyID/characters",characterroutes);
Router.use("/:storyID/",actionroutes);
module.exports=Router;