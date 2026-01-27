const ApiError = require("../utils/apierror");

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }
    next();
  };
};

module.exports = allowRoles;
