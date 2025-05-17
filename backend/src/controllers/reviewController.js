const Review = require("../models/Review");
const Project = require("../models/Project");
const User = require("../models/User");

// Ortalamayı güncelle
const updateFreelancerRating = async (freelancerId) => {
  const reviews = await Review.find({ freelancer: freelancerId });
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = reviews.length ? total / reviews.length : 0;

  await User.findByIdAndUpdate(freelancerId, {
    'rating.average': average,
    'rating.count': reviews.length
  });
};

// Yorum oluşturma
const createReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user._id;

    const project = await Project.findById(projectId).populate('acceptedBid');
    if (!project) return res.status(404).json({ success: false, message: "Proje bulunamadı." });

    const isEligible = project.isApproved || project.status === 'completed';
    if (!isEligible) return res.status(400).json({ success: false, message: "Proje tamamlanmadan yorum yapılamaz." });

    if (project.employer.toString() !== reviewerId)
      return res.status(403).json({ success: false, message: "Sadece proje sahibi yorum yapabilir." });

    const existing = await Review.findOne({ reviewer: reviewerId, freelancer: project.acceptedBid.freelancer,
        project: projectId
     });
    if (existing)
      return res.status(400).json({ success: false, message: "Zaten bu freelancer'a yorum yaptınız." });

    const review = await Review.create({
      reviewer: reviewerId,
      freelancer: project.acceptedBid.freelancer,
      rating,
      comment,
      project: project._id 
    });

    await updateFreelancerRating(project.acceptedBid.freelancer);

    res.status(201).json({ success: true, message: "Yorum oluşturuldu.", data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Yorum oluşturulamadı." });
  }
};

// Yorum güncelleme
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Yorum bulunamadı." });

    if (review.reviewer.toString() !== reviewerId)
      return res.status(403).json({ success: false, message: "Sadece yorum sahibi güncelleyebilir." });

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await updateFreelancerRating(review.freelancer);

    res.status(200).json({ success: true, message: "Yorum güncellendi.", data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Yorum güncellenemedi." });
  }
};

// Yorum silme
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Yorum bulunamadı." });

    if (review.reviewer.toString() !== reviewerId)
      return res.status(403).json({ success: false, message: "Sadece yorum sahibi silebilir." });

    await review.remove();
    await updateFreelancerRating(review.freelancer);

    res.status(200).json({ success: true, message: "Yorum silindi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Yorum silinemedi." });
  }
};

// Freelancer'ın aldığı yorumlar
const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const reviews = await Review.find({ freelancer: freelancerId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Yorumlar alınamadı." });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getFreelancerReviews,
};
