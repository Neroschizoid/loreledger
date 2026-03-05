const mongoose = require("mongoose");
const Character = require("../models/character")
const asyncwrapper = require("../middlewares/asyncwrapper");
const ApiError = require("../utils/apierror");
const Story = require("../models/story")


const getCharacter = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;

  const data = await Character.find({
    storyId: storyID,
  }).populate("storyId", "title").populate("ownerId", "username");
  const characters = data.map(c => ({
    id: c._id,
    name: c.name,
    race: c.race,
    gender: c.gender,
    age: c.age,
    role: c.role,
    personalities: c.personalities,
    story: c.storyId.title,
    owner: c.ownerId.username
  }));

  const msg = characters.length > 0 ? "Characters are returned" : "No characters exist";
  res.status(200).json({
    sucess: true,
    data: characters,
    message: msg,
  })
})

const getMyCharacter = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;

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
      race: c.race,
      gender: c.gender,
      age: c.age,
      role: c.role,
      personalities: c.personalities,
      story: c.storyId.title,
      owner: c.ownerId.username
    })),
    message: characters.length
      ? "Characters are returned"
      : "No characters exist"
  });
});


const postCharacter = asyncwrapper(async (req, res) => {
  const { storyID } = req.params;
  const { name, race, gender, age, role, personalities } = req.body;

  if (!name || !race || !gender || !age) {
    throw new ApiError(400, "Name, race, gender, and age are required.");
  }

  const story = await Story.findById(storyID);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  const isAuthor = story.authorId.toString() === req.user.userId;

  if (!isAuthor) {
    const exist = await Character.findOne({
      storyId: storyID,
      ownerId: req.user.userId
    });

    if (exist) {
      throw new ApiError(409, "Character already exists for this story");
    }
  }

  const characterData = {
    name,
    race,
    gender,
    age,
    storyId: storyID,
    ownerId: req.user.userId,
    isAuthorCreated: isAuthor
  };

  if (isAuthor) {
    if (role) characterData.role = role;
    if (personalities) characterData.personalities = personalities;
  }

  const character = await Character.create(characterData);

  res.status(201).json({
    success: true,
    character
  });
});

const updateCharacter = asyncwrapper(async (req, res) => {
  const { storyID, characterId } = req.params;
  const { role, personalities } = req.body;

  const story = await Story.findById(storyID);
  if (!story || story.authorId.toString() !== req.user.userId) {
    throw new ApiError(403, "Only the author can update character roles and personalities.");
  }

  const character = await Character.findById(characterId);
  if (!character || character.storyId.toString() !== storyID) {
    throw new ApiError(404, "Character not found or mismatch");
  }

  if (role) character.role = role;
  if (personalities) character.personalities = personalities;

  await character.save();

  res.status(200).json({
    success: true,
    character
  });
});

module.exports = { getCharacter, getMyCharacter, postCharacter, updateCharacter }