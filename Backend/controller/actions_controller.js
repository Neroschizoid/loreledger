const mongoose = require("mongoose");
const Action = require("../models/action")
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");

const getAction = asyncwrapper( async (req,res)=>{
    const characterId=req.params.characterId;
     if (!characterId) {
    throw new ApiError(400, "Character ID is missing");
  }
    if(!mongoose.Types.ObjectId.isValid(characterId)){
        throw new ApiError(400,"Invalid Character Id");
    }
    const data = await Action.find({
        characterId:characterId
    }).populate("storyId","title").populate("characterId","name");
    const action=data.map(a=>({
        id:a._id,
        story:a.storyId.title,
        Character:a.characterId.name,
        action:a.content
    }))
    const msg=action==[]?"actions are returned":"No actions exist";
    res.status(200).json({
        suceess:true,
        data:action,
        message:msg,
    })
})

const postAction = asyncwrapper( async(req,res)=>{

    const {content,characterId,storyId}=req.body;
    if(!content||!characterId||!storyId){
        throw new ApiError(400,"Required data is missing");
    }
    
    const action = await Action.create({
        content,characterId,storyId
    })
    console.log("Action was added :",action);
    res.status(201).json({
        sucess:true,
        message: "Action was successfully added"
    })
})

module.exports={getAction,postAction}