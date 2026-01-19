const mongoose = require("mongoose");
const Character = require("../models/character")
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");

const getCharacter = asyncwrapper( async (req,res)=>{
    const storyID=req.params.storyID;
     if (!storyID) {
    throw new ApiError(400, "Story ID is missing");
  }
    if(!mongoose.Types.ObjectId.isValid(storyID)){
        throw new ApiError(400,"Invalid Id");
    }
    const data = await Character.find({
        storyId : storyID,
    }).populate("storyId","title").populate("ownerID","name");
    const characters = data.map(c=>({
        id:c._id,
        name:c.name,
        story:c.storyId.title,
        owner:c.ownerID.name
    }));
    const msg=characters==[]?"Characters are returned":"No characters exist";
    res.status(200).json({
        suceess:true,
        data:characters,
        message:msg,
    })
})

const postCharacter = asyncwrapper( async(req,res)=>{
    console.log(req.params.storyID);
    const storyID=req.params.storyID;
    const {name,ownerID}=req.body;
    if(!name || !ownerID){
        throw new ApiError(400,"No name or ownerID is provided");
    }
      if (!storyID) {
    throw new ApiError(400, "Story ID is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(storyID)) {
    throw new ApiError(400, "Invalid Story ID");
  }
    const character = await Character.create({
        name:name,
        storyId:storyID,
        ownerID:ownerID
    })
    console.log("character was created :",character);
    res.status(201).json({
        sucess:true,
        message: "character was successfully added"
    })
})

module.exports={getCharacter,postCharacter}