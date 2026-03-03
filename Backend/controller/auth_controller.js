const mongoose = require("mongoose");
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");
const User = require("../models/user");
const generateToken = require("../utils/jwt");


const register = asyncwrapper(async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({
    $or: [
      { email: email },
      { username: username }
    ]
  });
  if (exists) {
    throw new ApiError(409, "User already exists");
  }
  await User.create({ username, email, password });
  res.status(201).json({
    success: true,
    message: "User registered"
  })

})

const login = asyncwrapper(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }


  const token = generateToken({
    userId: user._id
  });



  res.status(200).json({
    success: true, token,
    message: "Login successful"
  })
})


module.exports = { register, login };