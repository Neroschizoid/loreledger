const express = require("express");
const cors = require("cors");
const ratelimiter=require("./middlewares/ratelimiter")
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(ratelimiter)


app.use("/api",require("./routes/health_route"));

const errorhandler = require("./middlewares/errorhandler")
app.use(errorhandler);

module.exports = app;
