const User = require("../models/User");
const Project = require("../models/Project");

const uploadPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;  // Token'dan alınan kullanıcı ID'si

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Dosya bulunamadı." });
    }

    const user = await User.findById(userId); // Kullanıcıyı token'dan alınan ID ile bulalım

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // Yeni dosyayı portfolio dizisine ekleyelim
    user.portfolio.push({
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`, // Dosyanın yolu
      uploadedAt: new Date(),
    });

    await user.save();

    res.status(200).json({ success: true, message: "Portfolyo başarıyla yüklendi." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Portfolyo yüklenirken bir hata oluştu." });
  }
};

const uploadProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Dosya bulunamadı." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Proje bulunamadı." });
    }

    // Projeye dosya ekleyelim
    project.projectSubmissions.push({
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`, // Dosya yolu
      uploadedAt: new Date(),
    });

    // Freelancer projeyi yüklediği için, isSubmitted'i true yapıyoruz
    project.isSubmitted = true;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Proje dosyası başarıyla yüklendi.",
      project: project
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Proje dosyası yüklenirken bir hata oluştu." });
  }
};

module.exports = { uploadPortfolio, uploadProject };