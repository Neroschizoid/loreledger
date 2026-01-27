const mongoose = require("mongoose");
const Action = require("../models/action")
const Character=require("../models/character")
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");


const resolveCharacter = async ({ storyId, user, characterId }) => {
  // AUTHOR: explicit character
  if (user.role === "AUTHOR") {
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
        console.log(characterId);
      throw new ApiError(400, "Invalid character ID");
    }

    const character = await Character.findById(characterId);
    if (!character) throw new ApiError(404, "Character not found");

    if (character.storyId.toString() !== storyId) {
      throw new ApiError(400, "Character does not belong to this story");
    }

    return character;
  }

  // NON-AUTHOR: infer character
  const character = await Character.findOne({
    storyId,
    ownerId: user.userId
  });

  if (!character) {
    throw new ApiError(404, "Character not found for this story");
  }

  return character;
};


const getActions = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;
  const { characterId } = req.params; // only AUTHORS use this

  if (!mongoose.Types.ObjectId.isValid(storyID)) {
    throw new ApiError(400, "Invalid story ID");
  }

  const character = await resolveCharacter({
    storyId:storyID,
    user: req.user,
    characterId
  });

  const actions = await Action.find({
    characterId: character._id
  });

  res.json({
    success: true,
    data: actions,
    message: actions.length
      ? "Actions retrieved"
      : "No actions exist"
  });
});


const postAction = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;
  const { content } = req.body;
  const { characterId } = req.body; // AUTHOR only

  if (!content) {
    throw new ApiError(400, "Action content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(storyID)) {
    throw new ApiError(400, "Invalid story ID");
  }

  const character = await resolveCharacter({
    storyId:storyID,
    user: req.user,
    characterId
  });

  const action = await Action.create({
    content,
    storyId:storyID,
    characterId: character._id,
    scenario: "LOCAL" // default, future-ready
  });

  res.status(201).json({
    success: true,
    action
  });
});


const updateAction = asyncwrapper(async (req, res) => {
  const { storyID, actionId } = req.params;
  const { content } = req.body;
  const { characterId } = req.body; // AUTHOR only

  if (!content) {
    throw new ApiError(400, "Action content is required");
  }

  const action = await Action.findById(actionId);
  if (!action) throw new ApiError(404, "Action not found");

  const character = await resolveCharacter({
    storyId:storyID,
    user: req.user,
    characterId
  });

  if (action.characterId.toString() !== character._id.toString()) {
    throw new ApiError(403, "Action does not belong to this character");
  }

  action.content = content;
  await action.save();

  res.json({
    success: true,
    action
  });
});


module.exports={getActions,postAction,updateAction}