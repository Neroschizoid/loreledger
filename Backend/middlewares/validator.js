const ApiError = require("../utils/apierror")

const validate = schema => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    next();
  } catch (err) {
    next(new ApiError(400, "Invalid request data", err.errors));
  }
};

module.exports = validate;