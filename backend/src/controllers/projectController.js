const Project = require("../models/Project.js");

// Proje oluşturma (default status: 'open')
const createProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      employer: req.user.id,
      // status default olarak 'open' kalacak
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Proje oluşturulurken bir hata oluştu.",
    });
  }
};

// Tüm projeleri getir
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("employer", "name email");

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
          message: "Proje tamamlanmamış. Lütfen önce freelancer'ın projeyi teslim etmesini bekleyin.",
        });
      }
    }

    // Freelancer, projeyi teslim ediyor
    if (project.status === "in progress" && project.freelancer.toString() === req.user.id) {
      project.status = "completed"; // Freelancer projeyi teslim etti
      await project.save();

      return res.status(200).json({
        success: true,
        message: "Proje başarıyla teslim edildi. Employer tarafından onaylanabilir.",
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
    const { id } = req.params; // Proje ID'sini almak için
    const userId = req.user.id; // authenticated user'dan userId'yi almak

    // Projeyi bulalım
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Proje bulunamadı." });
    }

    // Proje sahibinin (Employer) doğruluğunu kontrol edelim
    if (project.employer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Bu projeyi onaylama yetkiniz yok." });
    }

    // Proje teslim edilmedi mi kontrol edelim
    if (!project.isSubmitted) {
      return res.status(400).json({ success: false, message: "Proje teslim edilmedi." });
    }

    // Projeyi onaylıyoruz
    project.isApproved = true;
    project.status = "completed"; // Proje tamamlandı durumu

    await project.save();

    res.status(200).json({
      success: true,
      message: "Proje başarıyla onaylandı.",
      project: project
    });
  } catch (error) {
    console.error("Onaylama hatası:", error);
    res.status(500).json({ success: false, message: "Proje onaylanırken bir hata oluştu." });
  }
};



module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  completeProject,
  approveProject
};
