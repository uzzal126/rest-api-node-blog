import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

export const Comment = mongoose.model("Comment", commentSchema);
