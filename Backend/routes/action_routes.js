const express = require('express');
const Router = express.Router({ mergeParams: true });
const { getActions, postAction, updateAction, requestGlobalStatus, getGlobalRequests, resolveGlobalRequest } = require("../controller/actions_controller")
const authMiddleware = require("../middlewares/authmiddleware")

Router.use(authMiddleware)

Router.route("/actions").get(getActions).post(postAction);

Router.route("/actions/:actionId/request-global").post(requestGlobalStatus);
Router.route("/requests").get(getGlobalRequests);
Router.route("/requests/:requestId").put(resolveGlobalRequest);

Router.route("/character/:characterId/actions").get(getActions);
Router.route("/actions/:actionId").put(updateAction);
module.exports = Router;