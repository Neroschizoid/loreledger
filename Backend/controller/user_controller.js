const mongoose = require("mongoose");
const User = require("../models/user");
const asyncwrapper= require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");


const getmyinfo= asyncwrapper(async (req,res)=>{
        const id=req.user.userId;
        const user = await User.findById(id).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success:true,
    your_data:user });
} );

const getUsers = asyncwrapper(async (req,res)=>{
        const users = await User.find();
        const empty=users.size>0?1:0;
        res.status(200).json({
            sucess:true,
            data:users,
            message: empty?"Users fetched succesfully":"No user found"
        });
} );


const createUser = asyncwrapper(async (req,res)=>{
    console.log(req.body);
    const {name,email} = req.body;
    if(!name || !email){
        const errmsg= !name?!email?"email and name are not provided":"name is not provided":"email is not provided";
        throw new ApiError(400,errmsg);
    }
    const user = await User.create({
        name,email
    });
    console.log("User created",user);
    res.status(201).json({
        sucess:true,
        message: "User was successfully added"
    });
});



module.exports= {getUsers,createUser,getmyinfo}