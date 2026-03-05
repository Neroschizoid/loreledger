const express = require('express');
const Router = express.Router({ mergeParams: true });
const { getCharacter, getMyCharacter, postCharacter, updateCharacter } = require("../controller/character_controller")
const authMiddleware = require("../middlewares/authmiddleware")


Router.route("/").get(getCharacter).post(authMiddleware, postCharacter);

Router.route("/me").get(authMiddleware, getMyCharacter)
Router.route("/:characterId").put(authMiddleware, updateCharacter);
module.exports = Router;