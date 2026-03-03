const { z } = require("zod");
const { empty } = require("./common");

const registerSchema = z.object({
  params: empty,
  body: z.object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(8)
  }),
  query: empty
});

const loginSchema = z.object({
  params: empty,
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1)
  }),
  query: empty
});

module.exports = {
  registerSchema,
  loginSchema
};
