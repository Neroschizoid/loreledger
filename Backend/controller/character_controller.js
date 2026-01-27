const mongoose = require("mongoose");
const Character = require("../models/character")
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");
const Story=require("../models/story")


const getCharacter = asyncwrapper( async (req,res)=>{
    const {storyID}=req.params;
    
    if(!mongoose.Types.ObjectId.isValid(storyID)){
        throw new ApiError(400,"Invalid Id");
    }
    const data = await Character.find({
        storyId : storyID,
    }).populate("storyId","title").populate("ownerId","username");
    const characters = data.map(c=>({
        id:c._id,
        name:c.name,
        story:c.storyId.title,
        owner:c.ownerId.username
    }));
    const msg=characters.length>0?"Characters are returned":"No characters exist";
    res.status(200).json({
        sucess:true,
        data:characters,
        message:msg,
    })
})

const getMyCharacter = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(storyID)) {
    throw new ApiError(400, "Invalid Story ID");
  }

  const characters = await Character.find({
    storyId: storyID,
    ownerId: req.user.userId
  })
    .populate("storyId", "title")
    .populate("ownerId", "username");

  res.status(200).json({
    success: true,
    data: characters.map(c => ({
      id: c._id,
      name: c.name,
      story: c.storyId.title,
      owner: c.ownerId.username
    })),
    message: characters.length
      ? "Characters are returned"
      : "No characters exist"
  });
});



const postCharacter = asyncwrapper( async(req,res)=>{
    const storyID=req.params.storyID;
    if (!mongoose.Types.ObjectId.isValid(storyID)) {
    throw new ApiError(400, "Invalid Story ID");
  }

  const exist=await Character.findOne({
    storyId:storyID,
    ownerId:req.user.userId 
  });
  console.log(exist);

    const {name}=req.body;
    const story=await Story.findById(storyID);
    if(!story){
        throw new ApiError(404,"No such story exist");
    }

    if(!name){
        throw new ApiError(400,"No nameis provided");
    }

    const character = await Character.create({
        name:name,
        storyId:storyID,
        ownerId:req.user.userId,
        isAuthorCreated: req.user.role === "AUTHOR"
    })
    console.log("character was created :",character);
    res.status(201).json({
        sucess:true,
        character
    })
})

module.exports={getCharacter,getMyCharacter,postCharacter}