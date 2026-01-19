const mongoose = require("mongoose");
const Story = require("../models/story");
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");

const createStory = asyncwrapper(async (req,res)=>{
    const {title,description} = req.body;
     if(!title){
        throw new ApiError(400,"No title is provided");
    }
    const story = await Story.create({
        title,description
    })
    console.log("Story was created :",story);
    res.status(201).json({
        sucess:true,
        message: "Story was successfully added"
    })

});

const getstories = asyncwrapper(async (req,res)=>{
    const stories = await Story.find();
    const empty=stories==[]?1:0;
    res.status(200).json({
         sucess:true,
        data:stories,
        message: empty?"Stories fetched succesfully":"No stories found"
    })
})


const getstorybyid = asyncwrapper(async (req,res)=>{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid Id");
    }
    const story = await Story.findById(id);
    if(!story){
        throw new ApiError(404,"Resource not found");
    }
    // if(story.user.equals(req.user.id)){
    //     throw new ApiError(403, "Forbidden");
    // }
    res.status(200).json({
        sucess:true,
        data:story,
         message: "Story is found"
    })
})

module.exports =  {createStory,getstories,getstorybyid};