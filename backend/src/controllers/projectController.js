const Project = require("../models/Project.js");
const Bid = require("../models/Bid.js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');


// Proje oluşturma (default status: 'open')
const createProject = async (req, res) => {
  try {
    const { title, description, budget, category, tags, deadline } = req.body;

    // Validation
    if (!title || !description || !budget || !category) {
      return res.status(400).json({
        success: false,
        message: "Başlık, açıklama, bütçe ve kategori alanları zorunludur.",
      });
    }

    const project = await Project.create({
      title,
      description,
      budget,
      category,
      tags: tags || [],
      deadline: deadline || null,
      employer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Proje başarıyla oluşturuldu!",
      data: project,
    });
  } catch (err) {
    console.error("Proje oluşturma hatası:", err);
    res.status(500).json({
      success: false,
      message: "Proje oluşturulurken bir hata oluştu.",
    });
  }
};

// Tüm projeleri getir
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "open" }).populate(
      "employer",
      "name email"
    );

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Projeler listelenirken bir hata oluştu.",
    });
  }
};

// Proje güncelleme (status dışarıdan değiştirilemez!)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı." });
    }

    if (project.employer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Bu projeyi güncelleme yetkiniz yok.",
      });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.budget = req.body.budget || project.budget;
    // project.status dışarıdan güncellenemez!

    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Proje güncellenirken bir hata oluştu.",
    });
  }
};

// Proje silme
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı." });
    }

    if (project.employer.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Bu projeyi silme yetkiniz yok." });
    }

    await project.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Proje başarıyla silindi." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Proje silinirken bir hata oluştu." });
  }
};
// Proje tamamlama ve onaylama (Freelancer projeyi teslim eder, Employer onaylar)
const completeProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Projeyi bulalım
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    // Eğer proje durumunu değiştirmeye çalışıyorsanız ve kullanıcı sadece employer ise,
    // onaylama işlemi yapılabilir.
    if (project.employer.toString() === req.user.id) {
      // Employer, projeyi onaylamak istiyor
      if (project.status === "completed") {
        project.status = "approved"; // İşveren projeyi onaylıyor
        await project.save();

        return res.status(200).json({
          success: true,
          message: "Proje başarıyla onaylandı.",
          data: project,
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Proje tamamlanmamış. Lütfen önce freelancer'ın projeyi teslim etmesini bekleyin.",
        });
      }
    }

    // Freelancer, projeyi teslim ediyor
    if (
      project.status === "in progress" &&
      project.freelancer.toString() === req.user.id
    ) {
      project.status = "completed"; // Freelancer projeyi teslim etti
      await project.save();

      return res.status(200).json({
        success: true,
        message:
          "Proje başarıyla teslim edildi. Employer tarafından onaylanabilir.",
        data: project,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Bu işlem için yetkiniz yok.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Proje işleminde bir hata oluştu.",
    });
  }
};

//! Proje onaylama (Employer, projeyi onaylar)
const approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    if (project.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bu projeyi onaylama yetkiniz yok.",
      });
    }

    if (!project.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: "Proje teslim edilmedi.",
      });
    }

    // Projeyi onayla
    project.isApproved = true;
    project.status = "completed";
    await project.save();

    res.status(200).json({
      success: true,
      message: "Proje başarıyla onaylandı. Artık yorum yapabilirsiniz.",
      project: project,
    });
  } catch (error) {
    console.error("Onaylama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Proje onaylanırken bir hata oluştu.",
    });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ employer: req.user._id });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err) {
    console.error("Kendi projelerini alırken hata:", err);
    res.status(500).json({
      success: false,
      message: "Projeler alınırken bir hata oluştu.",
    });
  }
};

// Tamamlanan projeleri getir (paymentStatus: completed)
const getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      employer: req.user._id,
      paymentStatus: "completed"
    })
    .populate("acceptedBid")
    .populate({
      path: "acceptedBid",
      populate: {
        path: "freelancer",
        select: "name email profileImage"
      }
    })
    .sort({ updatedAt: -1 }); // En son güncellenenler önce

    // Proje verilerini frontend için uygun formata çevir
    const formattedProjects = projects.map(project => {
      const acceptedBid = project.acceptedBid;
      return {
        id: project._id,
        title: project.title,
        description: project.description,
        amount: acceptedBid ? acceptedBid.amount : project.budget,
        completedDate: project.updatedAt,
        freelancer: acceptedBid && acceptedBid.freelancer ? acceptedBid.freelancer.name : "Bilinmiyor",
        freelancerEmail: acceptedBid && acceptedBid.freelancer ? acceptedBid.freelancer.email : null,
        freelancerAvatar: acceptedBid && acceptedBid.freelancer && acceptedBid.freelancer.profileImage
          ? acceptedBid.freelancer.profileImage.fileUrl
          : null,
        paymentStatus: project.paymentStatus,
        status: project.status,
        rating: 4.8, // Şimdilik sabit, sonra review sisteminden gelecek
        category: "Web Development", // Şimdilik sabit, sonra project model'e eklenecek
        duration: calculateProjectDuration(project.createdAt, project.updatedAt),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProjects,
      count: formattedProjects.length,
      totalAmount: formattedProjects.reduce((sum, project) => sum + project.amount, 0),
      averageRating: formattedProjects.reduce((sum, project) => sum + project.rating, 0) / formattedProjects.length || 0
    });
  } catch (err) {
    console.error("Tamamlanan projeler alınırken hata:", err);
    res.status(500).json({
      success: false,
      message: "Tamamlanan projeler alınırken bir hata oluştu.",
    });
  }
};

// Proje süresini hesaplayan yardımcı fonksiyon
const calculateProjectDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 gün";
  if (diffDays < 30) return `${diffDays} gün`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} ay`;
  return `${Math.round(diffDays / 365)} yıl`;
};
// Belirli bir projeyi ID'ye göre getir
const getProjectById = async (req, res) => {
  const { id } = req.params;

  // ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Geçersiz proje ID'si"
    });
  }

  try {
    const project = await Project.findById(id)
      .populate('employer', 'name email profileImage rating') // Employer bilgilerini ekle
      .populate('bids')
      .populate({
        path: 'acceptedBid',
        populate: {
          path: 'freelancer',
          select: 'name email profileImage rating'
        }
      })
      .populate('projectSubmissions');

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı" });
    }
    return res.json({ success: true, data: project });
  } catch (error) {
    console.error("Proje detayı alınırken hata:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};





module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  completeProject,
  approveProject,
  getMyProjects,
  getCompletedProjects,
  getProjectById,
};
