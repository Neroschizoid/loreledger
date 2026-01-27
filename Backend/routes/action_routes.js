const express = require('express');
const Router = express.Router({ mergeParams: true });
const {getActions,postAction,updateAction} = require("../controller/actions_controller")
const authMiddleware=require("../middlewares/authmiddleware")
const allowRoles=require("../middlewares/rolemiddleware")

Router.use(authMiddleware)

Router.route("/actions").get(getActions).post(allowRoles("AUTHOR","CHARACTER"),postAction);


Router.route("/character/:characterId/actions").get(allowRoles("AUTHOR"),getActions);
Router.route("/actions/:actionId").put(allowRoles("AUTHOR"),updateAction);
module.exports=Router;