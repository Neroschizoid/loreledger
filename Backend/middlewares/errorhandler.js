const ApiError = require("../utils/apierror")



const errorhandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  // Known / intentional errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Optional: validation library errors (future-ready)
  else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors;
  }

  // Log full error internally
  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports=errorhandler;
