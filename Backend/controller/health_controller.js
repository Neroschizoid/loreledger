const mongoose = require("mongoose");

const healthcheck=(req,res)=>{
    const dbstate=mongoose.connection.readyState===1?"connected":"disconnected";
    const ishealthy=dbstate=== "connected"

    res.status(ishealthy?200:500).json({
        status:ishealthy?"ok":"degraded",
        server: "running",
    database: dbstate,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),

    });
}

module.exports=healthcheck