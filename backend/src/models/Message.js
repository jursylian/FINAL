import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

messageSchema.index({ createdAt: -1 });

export default mongoose.model("Message", messageSchema);
