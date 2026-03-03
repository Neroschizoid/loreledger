const { z } = require("zod");
const { objectId, empty } = require("./common");

const getActionsSchema = z.object({
  params: z.object({
    storyID: objectId,
    characterId: objectId.optional() // AUTHOR only
  }),
  body: empty,
  query: empty
});

const postActionSchema = z.object({
  params: z.object({
    storyID: objectId
  }),
  body: z.object({
    content: z.string().min(1, "Action content is required"),
    characterId: objectId.optional()
  }),
  query: empty
});

const updateActionSchema = z.object({
  params: z.object({
    storyID: objectId,
    actionId: objectId
  }),
  body: z.object({
    content: z.string().min(1),
    characterId: objectId.optional()
  }),
  query: empty
});

module.exports = {
  getActionsSchema,
  postActionSchema,
  updateActionSchema
};
