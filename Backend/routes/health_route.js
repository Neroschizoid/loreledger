const express = require('express');
const Router = express.Router();
const healthcheck = require('../controller/health_controller')

Router.route("/").get(healthcheck);

module.exports=Router;
