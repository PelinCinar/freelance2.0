const Review = require("../models/Review");
const Project = require("../models/Project");
const User = require("../models/User");
const mongoose = require("mongoose");

// Freelancer rating'ini güncelle
const updateFreelancerRating = async (freelancerId) => {
  try {
    // freelancerId'nin ObjectId olduğundan emin ol
    let validFreelancerId;

    if (mongoose.Types.ObjectId.isValid(freelancerId)) {
      validFreelancerId = freelancerId;
    } else if (freelancerId && freelancerId._id) {
      validFreelancerId = freelancerId._id;
    } else if (freelancerId && freelancerId.toString) {
      validFreelancerId = freelancerId.toString();
    } else {
      console.error("❌ Geçersiz freelancerId:", freelancerId);
      return;
    }

    const reviews = await Review.find({ freelancer: validFreelancerId });

    if (reviews.length === 0) {
      // Hiç review yoksa rating'i sıfırla
      await User.findByIdAndUpdate(validFreelancerId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = total / reviews.length;

    await User.findByIdAndUpdate(validFreelancerId, {
      'rating.average': Math.round(average * 10) / 10, // 1 ondalık basamak
      'rating.count': reviews.length
    });
  } catch (error) {
    console.error("💥 Rating güncelleme hatası:", error);
  }
};

// Yorum oluşturma
const createReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Validation
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Puan ve yorum alanları zorunludur."
      });
    }

    if (rating < 0.5 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Puan 0.5-5 arasında olmalıdır."
      });
    }

    const project = await Project.findById(projectId).populate({
      path: 'acceptedBid',
      populate: {
        path: 'freelancer',
        select: '_id name email'
      }
    });
    if (!project) return res.status(404).json({ success: false, message: "Proje bulunamadı." });

    // Ödeme tamamlanmış mı kontrol et
    if (project.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Sadece ödemesi tamamlanan projeler için yorum yapabilirsiniz."
      });
    }

    // Kabul edilmiş teklif var mı kontrol et
    if (!project.acceptedBid) {
      return res.status(400).json({
        success: false,
        message: "Bu projede kabul edilmiş teklif bulunmuyor."
      });
    }

    if (project.employer.toString() !== reviewerId)
      return res.status(403).json({ success: false, message: "Sadece proje sahibi yorum yapabilir." });

    // Freelancer ID'sini doğru şekilde al
    const freelancerId = project.acceptedBid.freelancer._id || project.acceptedBid.freelancer;

    const existing = await Review.findOne({
      reviewer: reviewerId,
      freelancer: freelancerId,
      project: projectId
    });
    if (existing)
      return res.status(400).json({ success: false, message: "Zaten bu freelancer'a yorum yaptınız." });

    const review = await Review.create({
      reviewer: reviewerId,
      freelancer: freelancerId,
      rating,
      comment,
      project: project._id
    });

    await updateFreelancerRating(freelancerId);

    res.status(201).json({ success: true, message: "Yorum oluşturuldu.", data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Yorum oluşturulamadı." });
  }
};

// Yorum güncelleme
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Validation
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Puan ve yorum alanları zorunludur."
      });
    }

    if (rating < 0.5 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Puan 0.5-5 arasında olmalıdır."
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Değerlendirme bulunamadı."
      });
    }

    // Sahiplik kontrolü
    if (review.reviewer.toString() !== reviewerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu değerlendirmeyi güncelleme yetkiniz yok."
      });
    }

    // Review'ı güncelle
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Freelancer rating'ini yeniden hesapla
    await updateFreelancerRating(review.freelancer);

    // Güncellenmiş review'ı populate ile döndür
    const updatedReview = await Review.findById(id)
      .populate('project', 'title budget category')
      .populate('freelancer', 'name profileImage');

    res.status(200).json({
      success: true,
      message: "Değerlendirme başarıyla güncellendi.",
      data: updatedReview
    });
  } catch (err) {
    console.error("Review update error:", err);
    res.status(500).json({
      success: false,
      message: "Değerlendirme güncellenirken bir hata oluştu."
    });
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

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz freelancer ID."
      });
    }

    const reviews = await Review.find({ freelancer: freelancerId })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("Freelancer reviews fetch error:", err);
    res.status(500).json({ success: false, message: "Yorumlar alınamadı." });
  }
};

// Kullanıcının yaptığı yorumları getir (employer için)
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('project', 'title budget category')
      .populate('freelancer', 'name profileImage')
      .sort({ createdAt: -1 });

    // Null project kontrolü ve filtreleme
    const validReviews = reviews.filter(review => {
      if (!review.project) {
        console.warn("⚠️ Project bilgisi olmayan review:", review._id);
        return false;
      }
      if (!review.freelancer) {
        console.warn("⚠️ Freelancer bilgisi olmayan review:", review._id);
        return false;
      }
      return true;
    });

    res.status(200).json({
      success: true,
      data: validReviews
    });
  } catch (err) {
    console.error("My reviews fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Yorumlar alınırken bir hata oluştu."
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getFreelancerReviews,
  getMyReviews,
};
