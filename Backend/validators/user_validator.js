const { z } = require("zod");
const { empty } = require("./common");

const getUsersSchema = z.object({
  params: empty,
  body: empty,
  query: empty
});

const createUserSchema = z.object({
  params: empty,
  body: z.object({
    name: z.string().min(1),
    email: z.email()
  }),
  query: empty
});

module.exports = {
  getUsersSchema,
  createUserSchema
};
