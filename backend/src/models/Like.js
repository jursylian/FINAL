import mongoose from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
