const mongoose = require("mongoose");
const User = require("../models/user");
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");


const Character = require("../models/character");

const getmyinfo = asyncwrapper(async (req, res) => {
    const id = req.user.userId;
    const user = await User.findById(id).select("-password");

    res.json({
        success: true,
        your_data: user
    });
});

const getAllMyCharacters = asyncwrapper(async (req, res) => {
    const characters = await Character.find({ ownerId: req.user.userId }).populate("storyId", "title");
    res.status(200).json({
        success: true,
        data: characters,
        message: characters.length > 0 ? "Characters fetched" : "No characters found"
    });
});

const getUsers = asyncwrapper(async (req, res) => {
    const users = await User.find();
    const empty = users.size > 0 ? 1 : 0;
    res.status(200).json({
        sucess: true,
        data: users,
        message: empty ? "Users fetched succesfully" : "No user found"
    });
});


const createUser = asyncwrapper(async (req, res) => {
    console.log(req.body);
    const { name, email } = req.body;

    const user = await User.create({
        name, email
    });
    console.log("User created", user);
    res.status(201).json({
        sucess: true,
        message: "User was successfully added"
    });
});



module.exports = { getUsers, createUser, getmyinfo, getAllMyCharacters }