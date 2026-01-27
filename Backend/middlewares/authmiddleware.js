const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apierror");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach identity to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
