const express = require('express');
const Router = express.Router();
const {register,login} = require("../controller/auth_controller");
const {authLimiter} =require("../utils/ratelimit")
Router.route("/register").post(authLimiter,register);
Router.route("/login").post(authLimiter,login);

module.exports=Router;