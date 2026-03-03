const { z } = require("zod");
const { objectId, empty } = require("./common");

const getStoriesSchema = z.object({
  params: empty,
  body: empty,
  query: empty
});

const getStoryByIdSchema = z.object({
  params: z.object({
    id: objectId
  }),
  body: empty,
  query: empty
});

const createStorySchema = z.object({
  params: empty,
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional()
  }),
  query: empty
});

module.exports = {
  getStoriesSchema,
  getStoryByIdSchema,
  createStorySchema
};
