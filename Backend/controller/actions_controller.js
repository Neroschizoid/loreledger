const mongoose = require("mongoose");
const Action = require("../models/action")
const Character = require("../models/character")
const ActionRequest = require("../models/actionRequest");
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");


const Story = require("../models/story");

const resolveCharacter = async ({ storyId, user, characterId }) => {
  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, "Story not found");

  const isAuthor = story.authorId.toString() === user.userId;

  // AUTHOR: explicit character
  if (isAuthor && characterId) {
    const character = await Character.findById(characterId);
    if (!character) throw new ApiError(404, "Character not found");

    if (character.storyId.toString() !== storyId) {
      throw new ApiError(400, "Character does not belong to this story");
    }

    return character;
  }

  // NON-AUTHOR or no characterId provided: infer character
  const character = await Character.findOne({
    storyId,
    ownerId: user.userId
  });

  if (!character && !isAuthor) {
    throw new ApiError(404, "Character not found for this story");
  }

  // Authors might not have a character document themselves, handling this globally
  return character || { _id: null, isAuthor: true };
};


const getActions = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;
  const { characterId } = req.params; // only AUTHORS use this


  const character = await resolveCharacter({
    storyId: storyID,
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

  const character = await resolveCharacter({
    storyId: storyID,
    user: req.user,
    characterId
  });

  const action = await Action.create({
    content,
    storyId: storyID,
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


  const action = await Action.findById(actionId);
  if (!action) throw new ApiError(404, "Action not found");

  const character = await resolveCharacter({
    storyId: storyID,
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


const requestGlobalStatus = asyncwrapper(async (req, res) => {
  const { storyID, actionId } = req.params;

  const action = await Action.findById(actionId);
  if (!action) throw new ApiError(404, "Action not found");

  const character = await resolveCharacter({
    storyId: storyID,
    user: req.user,
    characterId: undefined // Automatically infer for the logged in user
  });

  if (action.characterId.toString() !== character._id.toString()) {
    throw new ApiError(403, "Action does not belong to this character");
  }

  // Ensure it's not already global
  if (action.scenario === "GLOBAL") {
    throw new ApiError(400, "Action is already GLOBAL");
  }

  // Check if a pending request already exists
  const existingRequest = await ActionRequest.findOne({
    actionId,
    status: "PENDING"
  });

  if (existingRequest) {
    throw new ApiError(400, "A PENDING request for this action already exists");
  }

  const request = await ActionRequest.create({
    actionId: action._id,
    storyId: storyID,
    characterId: character._id,
    status: "PENDING"
  });

  res.status(201).json({
    success: true,
    message: "Global status requested successfully",
    request
  });
});

const getGlobalRequests = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;

  const story = await Story.findById(storyID);
  if (!story || story.authorId.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized as the author of this story.");
  }

  const requests = await ActionRequest.find({ storyId: storyID, status: "PENDING" })
    .populate("actionId", "content")
    .populate("characterId", "name");

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

const resolveGlobalRequest = asyncwrapper(async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // "APPROVED" or "REJECTED"

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new ApiError(400, "Status must be APPROVED or REJECTED");
  }

  const request = await ActionRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Action request not found");

  const story = await Story.findById(request.storyId);
  if (!story || story.authorId.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized as the author of this story.");
  }

  request.status = status;
  await request.save();

  if (status === "APPROVED") {
    const action = await Action.findById(request.actionId);
    if (action) {
      action.scenario = "GLOBAL";
      await action.save();
    }
  }

  res.status(200).json({
    success: true,
    message: `Request ${status.toLowerCase()}`,
    request
  });
});

module.exports = { getActions, postAction, updateAction, requestGlobalStatus, getGlobalRequests, resolveGlobalRequest }