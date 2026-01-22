const express = require('express');
const Router = express.Router();
const {getAction,postAction} = require("../controller/actions_controller")

Router.route("/actions").post(postAction);
Router.route("/characters/:characterId/actions").get(getAction);


module.exports=Router;