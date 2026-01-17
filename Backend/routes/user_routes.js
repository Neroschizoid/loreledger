const express = require('express');
const Router = express.Router();
const {getUsers,createUser} = require("../controller/user_controller");

Router.route("/").get(getUsers).post(createUser);


module.exports=Router
