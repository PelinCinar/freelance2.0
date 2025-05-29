const Bid = require("../models/Bid");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const User = require("../models/User");

//!Proje CRUD işlemleri
const createBid = async (req, res) => {
  try {
    const { projectId } = req.params; // URL parametresinden proje ID'sini al
    const { amount, message } = req.body; // Body'dan teklif verilerini al
    const freelancerId = req.user._id; //giriş yapan freelancerımızı idsini de alalımm

    // Projeyi bulalımm
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    if (project.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Bu projeye teklif verilemez çünkü proje kapatılmış.",
      });
    }

    if (project.status === "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Bu projeye teklif verilemez çünkü proje şu anda yürütülüyor.",
      });
    }

    if (project.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Bu projeye teklif verilemez çünkü proje tamamlanmış.",
      });
    }

    const existingBid = await Bid.findOne({
      project: projectId,
      freelancer: freelancerId,
    });
    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: "Bu projeye zaten teklif verdiniz.",
      });
    }

    // Teklif oluşturalımm
    const bid = await Bid.create({
      project: projectId,
      freelancer: freelancerId,
      amount,
      message,
    });

    // Projeye teklif eklendiği zaman projeyi güncelleki array içerisinde göreyüm
    project.bids.push(bid._id); // Oluşturulan teklif projeye ekleyelimm
    await project.save();

    // Employer'a bildirim gönder
    const io = req.app.get('io');

    try {
      // Freelancer bilgilerini al
      const freelancer = await User.findById(freelancerId).select('name');

      // Veritabanına bildirim kaydet
      const notification = new Notification({
        user: project.employer, // Bildirimi alacak employer
        sender: freelancerId, // Bildirimi gönderen freelancer
        senderUsername: freelancer?.name || "Freelancer",
        roomId: project._id, // Proje ID'si room olarak kullanılacak
        type: "bid", // Teklif türü bildirim
        message: `"${project.title}" projenize ${freelancer?.name || 'Bir freelancer'} tarafından ${amount}₺ tutarında yeni bir teklif geldi!`,
        link: `/employer-panel/projects/${project._id}`, // Proje detay sayfasına yönlendirme
        isRead: false
      });

      await notification.save();

      // Socket.io ile canlı bildirim gönder
      if (io) {
        io.emit("notification", {
          _id: notification._id,
          user: project.employer,
          sender: freelancerId,
          senderUsername: freelancer?.name || "Freelancer",
          roomId: project._id,
          type: "bid",
          message: notification.message,
          link: notification.link,
          isRead: false,
          createdAt: notification.createdAt
        });
      }

      console.log(`📢 Teklif bildirimi gönderildi: ${project.title} - ${freelancer?.name}`);
    } catch (notificationError) {
      console.error("Bildirim oluşturulurken hata:", notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }

    res.status(201).json({
      success: true,
      message: "Teklif başarıyla oluşturuldu.",
      data: bid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Teklif oluşturulurken bir hata oluştu.",
    });
  }
};

//! Projeye gelen teklifleri görüntüleme (işveren içinçççç)
const getBidsByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId; //url parametresindden proje idsini alalım

    // Proje var mı kontrol edelim devamında işveren projeye sahip mi kontrole et
    const project = await Project.findById(projectId); //projeyi bulalum
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı." });
    }



    if (project.employer.toString() !== req.user._id.toString()) {
      //işverenin kim olduğunu kontrol edelim
      return res.status(401).json({
        success: false,
        message: "Bu projeye ait teklifleri görme yetkiniz yok.",
      });
    }

    // Teklifleri al
    const bids = await Bid.find({ project: projectId }).populate(
      "freelancer",
      "name email"
    ); //populete yöntemi ile bid collectiondaki belgeli projectıdye bağlı filtreler yani biz burada project alanı projectıdyle eşeleşen bid kayıtlarını bulundurmuş oluyoruz. user colletiodan name ve email almış olduk peki nasıl usera
    //!freelancer alanındaki ObjectId'yi takip et ve User koleksiyonundan sadece name ve email alanlarını getir.veri tekrarını önle.



    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Teklifler alınırken bir hata oluştu.",
    });
  }
};

//!Teklif güncelleme (freelancer için)
const updateBid = async (req, res) => {
  try {
    const { amount, message } = req.body;
    const bidId = req.params.id;

    const bid = await Bid.findById(bidId).populate("project");
    if (!bid) {
      return res.status(404).json({ success: false, message: "Teklif bulunamadı." });
    }

    if (bid.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Bu teklif kabul edilmiş, güncellenemez.",
      });
    }

    // Güncelleme işlemi
    bid.amount = amount;
    bid.message = message;
    await bid.save();

    return res.status(200).json({
      success: true,
      message: "Teklif başarıyla güncellendi.",
      data: bid,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Teklif güncellenirken bir hata oluştu.",
    });
  }
};



//! Teklif silme (freelancer için)
const deleteBid = async (req, res) => {
  try {
    const bidId = req.params.id;

    // Teklif var mı kontrol etttğ
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res
        .status(404)
        .json({ success: false, message: "Teklif bulunamadı." });
    }

    // Teklif sahibi freelancer'ı kontrol ettğ
    if (bid.freelancer.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Bu teklifi silme yetkiniz yok." });
    }

    await bid.deleteOne();

    res.status(200).json({
      success: true,
      message: "Teklif başarıyla silindi.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Teklif silinirken bir hata oluştu.",
    });
  }
};

//!Proje Teklif fonksiyonları
///api/bids/:bidId/accept
const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate("project").populate("freelancer", "name email");

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı.",
      });
    }

    const project = bid.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    // Projenin sahibi mi kontrol et
    if (project.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Bu teklifi kabul etme yetkiniz yok.",
      });
    }

    // Teklif zaten işlem görmüş mü kontrol et
    if (bid.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Bu teklif zaten işlem görmüş.",
      });
    }

    // ÖNEMLİ: Bu projede zaten kabul edilmiş bir teklif var mı kontrol et
    if (project.acceptedBid) {
      return res.status(400).json({
        success: false,
        message: "Bu projede zaten kabul edilmiş bir teklif bulunmaktadır.",
      });
    }

    // Diğer kabul edilmiş teklifler var mı kontrol et (ekstra güvenlik) bu önemlii
    const existingAcceptedBid = await Bid.findOne({
      project: project._id,
      status: "accepted"
    });

    if (existingAcceptedBid) {
      return res.status(400).json({
        success: false,
        message: "Bu projede zaten kabul edilmiş bir teklif bulunmaktadır.",
      });
    }

    // Teklifin status'ünü "accepted" yap
    bid.status = "accepted";
    await bid.save();

    // Proje durumunu 'in-progress' yap ve acceptedBid'i set et
    project.status = "in-progress";
    project.acceptedBid = bid._id;
    await project.save();

    // DİĞER TÜM TEKLİFLERİ OTOMATIK REDDET
    await Bid.updateMany(
      {
        project: project._id,
        _id: { $ne: bid._id }, // Kabul edilen teklif hariç
        status: "pending" // Sadece bekleyen teklifleri reddet
      },
      { status: "rejected" }
    );

    console.log(`✅ Teklif kabul edildi ve diğer teklifler reddedildi: ${project.title}`);

    // Mevcut bildirim sistemine uygun bildirim oluştur
    const io = req.app.get('io');

    if (bid.freelancer) {
      try {
        // Veritabanına bildirim kaydet
        const notification = new Notification({
          user: bid.freelancer._id, // Bildirimi alacak freelancer
          sender: req.user._id, // Bildirimi gönderen employer
          senderUsername: req.user.name || "İşveren",
          roomId: project._id, // Proje ID'si room olarak kullanılacak
          type: "offer", // Teklif türü bildirim
          message: `"${project.title}" projesindeki ${bid.amount}₺ tutarındaki teklifiniz kabul edildi! Projeye başlayabilirsiniz.`,
          link: `/chat/${project._id}`, // Sohbet sayfasına yönlendirme linki
          isRead: false
        });

        await notification.save();

        // Socket.io ile canlı bildirim gönder
        if (io) {
          io.emit("notification", {
            _id: notification._id,
            user: bid.freelancer._id,
            sender: req.user._id,
            senderUsername: req.user.name || "İşveren",
            roomId: project._id,
            type: "offer",
            message: notification.message,
            link: notification.link,
            isRead: false,
            createdAt: notification.createdAt
          });
        }

        console.log(`Bildirim gönderildi: ${bid.freelancer.name} - ${project.title}`);
      } catch (notificationError) {
        console.error("Bildirim oluşturulurken hata:", notificationError);
        // Bildirim hatası ana işlemi etkilemesin
      }
    }

    return res.status(200).json({
      success: true,
      message: "Teklif başarıyla kabul edildi ve proje başlatıldı.",
      data: bid,
    });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası, lütfen tekrar deneyin.",
    });
  }
};
const rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate("project").populate("freelancer", "name email");

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı.",
      });
    }

    const project = bid.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    // Projenin sahibi mi kontrol et
    if (project.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Bu teklifi reddetme yetkiniz yok.",
      });
    }

    // Teklif zaten işlem görmüş mü kontrol et
    if (bid.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Bu teklif zaten işlem görmüş.",
      });
    }

    // Teklifin status'ünü "rejected" yap
    bid.status = "rejected";
    await bid.save();

    // Bildirim oluştur (isteğe bağlı)
    const Notification = require("../models/Notification");
    const io = req.app.get('io');

    if (bid.freelancer) {
      try {
        // Veritabanına bildirim kaydet
        const notification = new Notification({
          user: bid.freelancer._id,
          sender: req.user._id,
          senderUsername: req.user.name || "İşveren",
          roomId: project._id,
          type: "offer",
          message: `"${project.title}" projesindeki teklifiniz maalesef reddedildi.`,
          link: `/freelancer-panel/projects`,
          isRead: false
        });

        await notification.save();

        // Socket.io ile canlı bildirim gönder
        if (io) {
          io.emit("notification", {
            _id: notification._id,
            user: bid.freelancer._id,
            sender: req.user._id,
            senderUsername: req.user.name || "İşveren",
            roomId: project._id,
            type: "offer",
            message: notification.message,
            link: notification.link,
            isRead: false,
            createdAt: notification.createdAt
          });
        }

        console.log(`Ret bildirimi gönderildi: ${bid.freelancer.name} - ${project.title}`);
      } catch (notificationError) {
        console.error("Bildirim oluşturulurken hata:", notificationError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Teklif başarıyla reddedildi.",
      data: bid,
    });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası, lütfen tekrar deneyin.",
    });
  }
};
const getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;
    const bids = await Bid.find({ freelancer: userId })
      .populate({
        path: 'project',
        populate: {
          path: 'employer',
          select: 'name email profileImage'
        }
      })
      .sort({ createdAt: -1 }); // En yeni teklifler önce

    res.status(200).json({ success: true, data: bids });
  } catch (err) {
    console.error("Teklifler alınamadı:", err);
    res.status(500).json({ success: false, message: "Teklifler alınamadı" });
  }
};
// Backend'deki getOpenProjectsWithBids fonksiyonu
//Durumu ‘open’ (açık) olan projeleri getir, eğer kabul edilmiş teklif (accepted bid) varsa bu projelerin durumunu ‘pasif’ olarak değiştir, ardından tekrar sadece açık projeleri getir ve döndür

const getOpenProjectsWithBids = async () => {
  try {
    let projects = await Project.find({ status: 'open' }).populate('bids');//populate('bids')` sayesinde her projenin `bids` (teklif) ilişkisi dolduruluyor.

    // Her projenin status'ünü kontrol edip gerekiyorsa güncelle
    await Promise.all(
      projects.map(async (project) => {
        const hasAcceptedBid = project.bids.some(bid => bid.status === 'accepted');
        if (hasAcceptedBid) {
          project.status = 'pasif';
          await project.save();
        }
      })
    );

    // Güncellenmiş projeleri tekrar çek
    const updatedProjects = await Project.find({ status: 'open' }).populate({
      path: 'bids',
      populate: { path: 'freelancer' }
    });

    return updatedProjects;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to fetch projects with bids');
  }
};





module.exports = {
  createBid,
  getBidsByProject,
  updateBid,
  deleteBid,
  acceptBid,
  rejectBid,
  getMyBids,
  getOpenProjectsWithBids
};
