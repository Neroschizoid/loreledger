const ApiError = require("../utils/apierror");
const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // 🔁 Duplicate key (Mongo)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists"
    });
  }

  // 🔁 Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join(", ")
    });
  }

  // Defaults
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  // 🔁 Known operational errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else {
    // 🔥 Log only unexpected errors
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = errorHandler;
