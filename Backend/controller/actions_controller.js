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

  // AUTHOR:
  if (isAuthor) {
    if (characterId) {
      const character = await Character.findById(characterId);
      if (!character) throw new ApiError(404, "Character not found");
      if (character.storyId.toString() !== storyId) {
        throw new ApiError(400, "Character does not belong to this story");
      }
      return character;
    }
    // If author provides no characterId, they are acting as Global Observer. Do not infer a local character!
    return { _id: null, isAuthor: true };
  }

  // NON-AUTHOR: infer character based on ownerId
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
  const { characterId } = req.query; // only AUTHORS use this

  const character = await resolveCharacter({
    storyId: storyID,
    user: req.user,
    characterId
  });

  let actionQuery = { storyId: storyID };

  // Non-authors only see GLOBAL actions and their OWN LOCAL actions
  if (!character.isAuthor) {
    actionQuery.$or = [
      { scenario: "GLOBAL" },
      { characterId: character._id }
    ];
  }

  // Populate both name and role for displaying the occupation
  const actions = await Action.find(actionQuery).populate("characterId", "name role");

  res.json({
    success: true,
    data: actions,
    message: actions.length ? "Actions retrieved" : "No actions exist"
  });
});


const postAction = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;
  const { content, scenario } = req.body; // AUTHORS can pass scenario
  const { characterId } = req.body;

  const character = await resolveCharacter({
    storyId: storyID,
    user: req.user,
    characterId
  });

  const action = await Action.create({
    content,
    storyId: storyID,
    ...(character._id && { characterId: character._id }), // Safely handle null character IDs
    scenario: (character.isAuthor && scenario) ? scenario : (character.isAuthor ? "GLOBAL" : "LOCAL")
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

  const story = await Story.findById(storyID);

  // Auto-approve if the requester is the story author
  if (story && story.authorId.toString() === req.user.userId) {
    action.scenario = "GLOBAL";
    await action.save();
    return res.status(200).json({
      success: true,
      message: "Action automatically made GLOBAL for author character",
      action
    });
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

const toggleScenario = asyncwrapper(async (req, res) => {
  const { storyID, actionId } = req.params;

  const story = await Story.findById(storyID);
  if (!story || story.authorId.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized as the author of this story.");
  }

  const action = await Action.findById(actionId);
  if (!action) throw new ApiError(404, "Action not found");
  if (action.storyId.toString() !== storyID) throw new ApiError(400, "Action does not belong to this story");

  action.scenario = action.scenario === "GLOBAL" ? "LOCAL" : "GLOBAL";
  await action.save();

  res.status(200).json({
    success: true,
    message: `Action switched to ${action.scenario}`,
    action
  });
});

const deleteAction = asyncwrapper(async (req, res) => {
  const { storyID, actionId } = req.params;

  const story = await Story.findById(storyID);
  if (!story || story.authorId.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized as the author of this story.");
  }

  const action = await Action.findOneAndDelete({ _id: actionId, storyId: storyID });
  if (!action) throw new ApiError(404, "Action not found");

  res.status(200).json({
    success: true,
    message: "Action deleted successfully"
  });
});

module.exports = { getActions, postAction, updateAction, requestGlobalStatus, getGlobalRequests, resolveGlobalRequest, toggleScenario, deleteAction }