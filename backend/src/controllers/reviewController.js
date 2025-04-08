const Review = require('../models/Review');
const Project = require('../models/Project');

// Proje için review oluşturma (sadece employer yapabilir!!!!!!)
const createReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // authenticated user

    // Projeyi bulalım
    const project = await Project.findById(projectId).populate('acceptedBid'); //biz burada project modelini kullanıp projeyi buluyoruz ve acceptbid alanını populete ediyoruz
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Proje bulunamadı." 
      });
    }

    // Sadece onaylanmış projelere review yapılabilir
    if (!project.isApproved) {
      return res.status(400).json({ 
        success: false, 
        message: "Sadece onaylanmış projelere yorum yapabilirsiniz." 
      });
    }

    // Sadece proje sahibi (employer) review yapabilir
    //objectidyistring yapmış oluyoeuz
    if (project.employer.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Sadece proje sahibi yorum yapabilir." 
      });
    }

    // Bu projeye daha önce review yapılmış mı kontrol et
    const existingReview = await Review.findOne({ 
      project: projectId, 
      reviewer: userId 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "Bu projeye zaten bir yorum yaptınız." 
      });
    }

    if (!project.acceptedBid) {
      return res.status(400).json({ 
        success: false, 
        message: "Bu projeye ait onaylı teklif bulunmamaktadır." 
      });
    }

    // Freelancer'ı acceptedBid'den alll
    const freelancerId = project.acceptedBid.freelancer;

    // Yeni review oluşturr
    const review = await Review.create({
      project: projectId,
      reviewer: userId,
      reviewee: freelancerId,
      rating,
      comment
    });

    // Projenin rating ortalamasını güncelleyelimm
    await updateProjectRating(projectId);

    res.status(201).json({
      success: true,
      message: "Yorum başarıyla oluşturuldu.",
      data: review
    });

  } catch (error) {
    console.error("Yorum oluşturma hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: "Yorum oluşturulurken bir hata oluştu." 
    });
  }
};

// Projenin rating ortalamasını güncelleyen fonk.
const updateProjectRating = async (projectId) => {
  const reviews = await Review.find({ project: projectId });
  
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;
    
    await Project.findByIdAndUpdate(projectId, {
      'rating.average': average,
      'rating.count': reviews.length
    });
  }
};

// Projeye ait review'ları getir
const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;

    const reviews = await Review.find({ project: projectId })
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error("Yorumları getirme hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: "Yorumlar getirilirken bir hata oluştu." 
    });
  }
};

// Kullanıcının aldığı review'ları getirme (freelancer için))
const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error("Kullanıcı yorumlarını getirme hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: "Kullanıcı yorumları getirilirken bir hata oluştu." 
    });
  }
};

module.exports = {
  createReview,
  getProjectReviews,
  getUserReviews
};