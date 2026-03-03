const express = require('express');
const Router = express.Router();
const {getUsers,createUser,getmyinfo} = require("../controller/user_controller");
const authMiddleware=require("../middlewares/authmiddleware")

Router.route("/").get(getUsers).post(createUser);
Router.route("/me/").get(authMiddleware,getmyinfo);

module.exports=Router
