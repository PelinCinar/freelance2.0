const Project = require("../models/Project.js");

const createProject = async (req, res) => {
  try {
    const { title, description, budget, status, employer } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      status, // Bu satırda status'ü de dahil ettik.
      employer: req.user.id, // İşverenin ID'si burada kullanılıyor
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
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    if (project.employer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Bu projeyi güncelleme yetkiniz yok.",
      });
    }

    // Projeyi güncelleğğ
    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.budget = req.body.budget || project.budget;
    project.status = req.body.status || project.status;

    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Proje güncellenirken bir hata oluştu.",
    });
  }
};
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    // Proje sahibi işvereni kontrol et
    if (project.employer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Bu projeyi silme yetkiniz yok.",
      });
    }

    // Projeyi sil
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Proje başarıyla silindi.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Proje silinirken bir hata oluştu.",
    });
  }
};
module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
