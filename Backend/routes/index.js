const express = require("express");

const userroutes = require("./user_routes");
const healthroute = require("./health_route")
const storyroutes=require("./story_routes")
const actionroutes=require("./action_routes");
const authroutes=require("./auth_routes")

const Router = express.Router();

Router.use("/health",healthroute);
Router.use("/users",userroutes);
Router.use("/story",storyroutes);
Router.use(actionroutes);
Router.use("/auth",authroutes);

module.exports = Router;