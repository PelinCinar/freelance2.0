const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "7d", // 7 gün sonra otomatik silinsin expires: "7d" demedik manuel olmasın.
    },
  },
  { timestamps: true } // createdAt ve updatedAt otomatik gelsin
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
