const express = require("express");
const cors = require("cors");
const ratelimiter = require("./middlewares/ratelimiter")
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(ratelimiter)

const routes = require("./routes/index")
app.use("/api", routes);

const messageroutes = require("./routes/message_routes");
app.use("/api/messages", messageroutes);

const errorhandler = require("./middlewares/errorhandler")
app.use(errorhandler);

module.exports = app;
