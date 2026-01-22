const express = require('express');
const Router = express.Router({ mergeParams: true });
const {getCharacter,postCharacter} = require("../controller/character_controller")


Router.route("/").get(getCharacter).post(postCharacter);


module.exports=Router;