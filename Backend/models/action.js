const mongoose=require("mongoose");
const SC_TYPE = {
  LOCAL:"LOCAL",
  GLOBAL:"GLOBAL"
};
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
          },
  scenario:{
  type:String,
  enum:Object.values(SC_TYPE),
  default: SC_TYPE.LOCAL
}
},

  { timestamps: true }
)

module.exports=mongoose.model("Action",actionschema);