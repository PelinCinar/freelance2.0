const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  freelancer: {
    // Freelancer (yorum alan)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewer: {
    // Employer (yorum yapan)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
