const express = require("express");

const userroutes = require("./user_routes");
const healthroute = require("./health_route")

const Router = express.Router();

Router.use("/health",healthroute);
Router.use("/users",userroutes);

module.exports = Router;