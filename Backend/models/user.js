const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const USER_ROLES = {
  AUTHOR: "AUTHOR",
  CHARACTER: "CHARACTER"
};
const userschema = new mongoose.Schema(
    {
    username:{
      type: String,
      required: true,
      unique: true
    },
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
    },
    },
  { timestamps: true }
);

userschema.pre("save", async function () {
  //we dont use arrow function cause they dont have this
  if (!this.isModified("password")) {
    return ;
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

});

userschema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User",userschema);
