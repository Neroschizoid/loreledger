const mongoose = require("mongoose");
const USER_ROLES = {
  ADMIN: "admin",
  CHARACTER: "character"
};
const userschema = new mongoose.Schema(
    {
    
    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CHARACTER
    },

    isActive: {
      type: Boolean,
      default: true
    }
    },
  { timestamps: true }
);

module.exports = mongoose.model("User",userschema);
