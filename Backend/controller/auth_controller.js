const mongoose = require("mongoose");
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");
const User = require("../models/user");
const register = asyncwrapper( async(req,res)=>{
    const {email,password} = req.body;
    if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }
  const exists = await User.findOne({email});
  if(exists){
    throw new ApiError(409, "User already exists");
  }
  await User.create({email,password});
  res.status(201).json({
     success: true,
    message: "User registered"
  })

})

const login = asyncwrapper( async(req,res)=>{
    const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.status(200).json({
    success: true,
    message: "Login successful"
  })
} )


module.exports={register,login};