const express = require('express');
const Router = express.Router({ mergeParams: true });
const {getCharacter,getMyCharacter,postCharacter} = require("../controller/character_controller")
const authMiddleware=require("../middlewares/authmiddleware")
const allowRoles=require("../middlewares/rolemiddleware")


Router.route("/").get(getCharacter).post(authMiddleware,allowRoles("AUTHOR","CHARACTER"),postCharacter);

Router.route("/me").get(authMiddleware,allowRoles("AUTHOR","CHARACTER"),getMyCharacter)
module.exports=Router;