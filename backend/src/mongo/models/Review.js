import mongoose from "mongoose";

function countSentences(txt = "") {
  const matches = (txt || "")
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.?!…]+[.?!…](\s|$)/g);
  return matches ? matches.length : 0;
}

const ReviewSchema = new mongoose.Schema(
  {
    trajetId: { type: Number, required: true, index: true },
    fromUserId: { type: Number, required: true, index: true },
    toUserId: { type: Number, required: true, index: true },
    note: { type: Number, min: 1, max: 5, required: true },
    commentaire: {
      type: String,
      trim: true,
      minlength: 24,
      validate: {
        validator: (v) => countSentences(v) >= 3,
        message: "Le commentaire doit contenir au moins trois phrases.",
      },
    },
    status: {
      type: String,
      enum: ["en_attente", "approuvé    ", "rejeté"],
      default: "en_attente",
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("Review", ReviewSchema);
é;
