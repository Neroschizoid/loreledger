const { z } = require("zod");
const { objectId, empty } = require("./common");

const getCharactersSchema = z.object({
  params: z.object({
    storyID: objectId
  }),
  body: empty,
  query: empty
});

const getMyCharacterSchema = z.object({
  params: z.object({
    storyID: objectId
  }),
  body: empty,
  query: empty
});

const postCharacterSchema = z.object({
  params: z.object({
    storyID: objectId
  }),
  body: z.object({
    name: z.string().min(1, "Character name is required")
  }),
  query: empty
});

module.exports = {
  getCharactersSchema,
  getMyCharacterSchema,
  postCharacterSchema
};
