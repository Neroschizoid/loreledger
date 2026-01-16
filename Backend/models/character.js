const mongoose=require("mongoose");

const characteschema=mongoose.Schema(
    {
    name: String,
    storyId:{
        type:mongoose.Schema.ObjectId,
        ref:"Story",
        required: true,
        },
    },
  { timestamps: true }
)

module.exports=mongoose.model("Character",characteschema);