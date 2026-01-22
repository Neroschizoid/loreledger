const mongoose=require("mongoose");

const actionschema=mongoose.Schema(
{
  content: String,
  characterId:{
    type:mongoose.Schema.ObjectId,
    ref: "Character",
    required: true,
  },
  storyId:{
          type:mongoose.Schema.ObjectId,
          ref:"Story",
          required: true,
          }
},
  { timestamps: true }
)

module.exports=mongoose.model("Action",actionschema);