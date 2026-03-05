const express = require('express');
const Router = express.Router();
const { getUsers, createUser, getmyinfo, getAllMyCharacters } = require("../controller/user_controller");
const authMiddleware = require("../middlewares/authmiddleware")

Router.route("/").get(getUsers).post(createUser);
Router.route("/me/").get(authMiddleware, getmyinfo);
Router.route("/me/characters").get(authMiddleware, getAllMyCharacters);

module.exports = Router
