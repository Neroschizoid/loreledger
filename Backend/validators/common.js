const { z } = require("zod");
const mongoose = require("mongoose");

const objectId = z.string().refine(
  val => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId" }
);


const empty = z.object({}).optional();

const paginationQuery = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

module.exports = {
  objectId,
  empty,
  paginationQuery
};
