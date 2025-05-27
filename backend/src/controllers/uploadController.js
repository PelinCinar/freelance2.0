const User = require("../models/User");
const Project = require("../models/Project");
const path = require("path"); // Bu satırı ekleyin
const fs = require("fs").promises; // Bu satırı ekleyin

const uploadPortfolio = async (req, res) => {
  try {
    const userId = req.user._id; // Token'dan alınan kullanıcı ID'si

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Dosya bulunamadı." });
    }

    const user = await User.findById(userId); // Kullanıcıyı token'dan alınan ID ile bulalım

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // Yeni dosyayı portfolio dizisine ekleyelim
    user.portfolio.push({
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`, // Dosyanın yolu
      uploadedAt: new Date(),
    });

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Portfolyo başarıyla yüklendi." });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Portfolyo yüklenirken bir hata oluştu.",
      });
  }
};

const uploadProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Dosya bulunamadı." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı." });
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
      project: project,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Proje dosyası yüklenirken bir hata oluştu.",
      });
  }
};

const deletePortfolioFile = async (req, res) => {
    const { fileName } = req.params;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        const fileToDeleteIndex = user.portfolio.findIndex(file => file.fileName === fileName);
        if (fileToDeleteIndex === -1) {
            return res.status(404).json({ success: false, message: "Silinecek dosya bulunamadı." });
        }

        const fileToDelete = user.portfolio[fileToDeleteIndex];
        const filePath = path.join(__dirname, '../../uploads', fileToDelete.fileName);

        try {
            // Dosyayı fiziksel olarak silmeye çalış
            await fs.unlink(filePath);
            console.log(`Dosya fiziksel olarak silindi: ${filePath}`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Eğer dosya bulunamadıysa (ENOENT hatası), bu bir hata değildir, sadece dosya zaten yok demektir.
                console.warn(`Uyarı: Fiziksel dosya bulunamadı ama veritabanında kaydı var. Kayıt siliniyor: ${filePath}`);
                // Kullanıcıya da bilgi vermek için success döndürebiliriz veya farklı bir mesaj.
                // İsteğe bağlı: return res.status(200).json({ success: true, message: "Dosya zaten bulunamadığından sadece veritabanından silindi." });
            } else {
                // ENOENT dışında bir hata olursa, bu gerçek bir hata demektir ve işlemi durdurmalıyız.
                console.error("Fiziksel dosya silinirken beklenmedik bir hata oluştu:", error);
                return res.status(500).json({ success: false, message: "Portfolyo dosyası silinirken beklenmedik bir hata oluştu." });
            }
        }

        // Fiziksel dosya silinse de silinmese de (ENOENT durumunda), veritabanı kaydını sil.
        user.portfolio.splice(fileToDeleteIndex, 1);
        await user.save();

        res.status(200).json({ success: true, message: "Portfolyo dosyası başarıyla silindi." });

    } catch (error) {
        console.error("Portfolyo silme hatası (genel yakalama):", error);
        res.status(500).json({ success: false, message: "Portfolyo dosyası silinirken bir hata oluştu." });
    }
};

const deleteProjectFile = async (req, res) => {
  const { projectId, fileName } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı." });
    }

    const fileToDeleteIndex = project.projectSubmissions.findIndex(
      (file) => file.fileName === fileName
    );
    if (fileToDeleteIndex === -1) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Silinecek proje dosyası bulunamadı.",
        });
    }

    const fileToDelete = project.projectSubmissions[fileToDeleteIndex];
    // Yükleme dizinine giden doğru yolu oluşturun
    const filePath = path.join(__dirname, "../../uploads", fileToDelete.fileName); // Yolun doğru olduğundan emin olun

    try {
      // Dosyayı fiziksel olarak silmeye çalış
      await fs.unlink(filePath);
      console.log(`Proje dosyası fiziksel olarak silindi: ${filePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Eğer dosya bulunamadıysa (ENOENT hatası), bu bir hata değildir, sadece dosya zaten yok demektir.
        console.warn(`Uyarı: Proje için fiziksel dosya bulunamadı ama veritabanında kaydı var. Kayıt siliniyor: ${filePath}`);
        // İsteğe bağlı: Kullanıcıya daha spesifik bir mesaj döndürebilirsiniz.
        // return res.status(200).json({ success: true, message: "Dosya zaten bulunamadığından sadece veritabanından silindi." });
      } else {
        // ENOENT dışında bir hata olursa, bu gerçek bir hata demektir ve işlemi durdurmalıyız.
        console.error("Proje dosyası fiziksel olarak silinirken beklenmedik bir hata oluştu:", error);
        return res.status(500).json({ success: false, message: "Proje dosyası silinirken beklenmedik bir hata oluştu." });
      }
    }

    // Fiziksel dosya silinse de silinmese de (ENOENT durumunda), veritabanı kaydını sil.
    project.projectSubmissions.splice(fileToDeleteIndex, 1);
    // isSubmitted durumunu güncelle: eğer hiç dosya kalmadıysa false yap
    project.isSubmitted = project.projectSubmissions.length > 0;
    await project.save();

    res
      .status(200)
      .json({ success: true, message: "Proje dosyası başarıyla silindi." });
  } catch (error) {
    console.error("Proje dosyası silme hatası (genel yakalama):", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Proje dosyası silinirken bir hata oluştu.",
      });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id; // Token'dan alınan kullanıcı ID'si

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Profil fotoğrafı bulunamadı." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // Eski profil fotoğrafını sil (eğer varsa)
    if (user.profileImage && user.profileImage.fileName) {
      const oldImagePath = path.join(__dirname, '../../images', user.profileImage.fileName);
      try {
        await fs.unlink(oldImagePath);
        console.log(`Eski profil fotoğrafı silindi: ${oldImagePath}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error("Eski profil fotoğrafı silinirken hata:", error);
        }
      }
    }

    // Yeni profil fotoğrafını kaydet
    user.profileImage = {
      fileName: req.file.filename,
      fileUrl: `/images/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profil fotoğrafı başarıyla yüklendi.",
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Profil fotoğrafı yüklenirken bir hata oluştu.",
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    if (!user.profileImage || !user.profileImage.fileName) {
      return res.status(404).json({ success: false, message: "Silinecek profil fotoğrafı bulunamadı." });
    }

    const imagePath = path.join(__dirname, '../../images', user.profileImage.fileName);

    try {
      // Dosyayı fiziksel olarak silmeye çalış
      await fs.unlink(imagePath);
      console.log(`Profil fotoğrafı fiziksel olarak silindi: ${imagePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Uyarı: Fiziksel profil fotoğrafı bulunamadı ama veritabanında kaydı var. Kayıt siliniyor: ${imagePath}`);
      } else {
        console.error("Fiziksel profil fotoğrafı silinirken beklenmedik bir hata oluştu:", error);
        return res.status(500).json({ success: false, message: "Profil fotoğrafı silinirken beklenmedik bir hata oluştu." });
      }
    }

    // Veritabanından profil fotoğrafı kaydını sil
    user.profileImage = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Profil fotoğrafı başarıyla silindi." });

  } catch (error) {
    console.error("Profil fotoğrafı silme hatası:", error);
    res.status(500).json({ success: false, message: "Profil fotoğrafı silinirken bir hata oluştu." });
  }
};

module.exports = {
  uploadPortfolio,
  uploadProject,
  deletePortfolioFile,
  deleteProjectFile,
  uploadProfileImage,
  deleteProfileImage,
};
