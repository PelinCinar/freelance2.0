const Bid = require("../models/Bid");
const Project = require("../models/Project");

//!Proje CRUD işlemleri
const createBid = async (req, res) => {
  try {
    const { projectId, amount, message } = req.body; //teklif verilerini alalum
    const freelancerId = req.user.id; //giriş yapan freelancerımızı idsini de alalımm

    // Projeyi bulalımm
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
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

    if (project.employer.toString() !== req.user.id) {
      //işverenin kim olduğunu kontrol edelim
      return res
        .status(401)
        .json({
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

    // Teklif var mı kontrol et
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res
        .status(404)
        .json({ success: false, message: "Teklif bulunamadı." });
    }

    // Teklif sahibi freelancer'ı kontrol et
    if (bid.freelancer.toString() !== req.user.id) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Bu teklifi güncelleme yetkiniz yok.",
        });
    }

    // Teklifi güncelle
    bid.amount = amount || bid.amount;
    bid.message = message || bid.message;

    await bid.save();

    res.status(200).json({
      success: true,
      message: "Teklif başarıyla güncellendi.",
      data: bid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
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

    console.log("Gelen bidId:", bidId);

    // Teklifi ve ilgili projeyi getiriyoruz
    const bid = await Bid.findById(bidId).populate("project");

    if (!bid) {
      console.log("Teklif veritabanında bulunamadı.");
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı.",
      });
    }

    console.log("Teklifin gerçek proje ID'si:", bid.project._id.toString());

    // Teklifin bağlı olduğu projeyi al
    const project = bid.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Teklifin bağlı olduğu proje bulunamadı.",
      });
    }

    // Teklifin status'ünü "accepted" yap
    bid.status = "accepted";
    await bid.save();

    // Proje status'ünü "closed" olarak güncelle
    project.status = "closed";

    // Kabul edilen teklifi projeye ekleyelim
    project.acceptedBid = bid._id;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Teklif başarıyla kabul edildi ve proje kapatıldı.",
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
    const { bidId } = req.params; //urldeen bidIdmiz alalımm

    // console.log("Gelen bidId:", bidId);

    // Teklif modelimiz içinde bidId aranır ve populete ile telklifin olduğu proje çekilir.
    const bid = await Bid.findById(bidId).populate("project");

    if (!bid) {
      console.log("Teklif veritabanında bulunamadı.");
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı.",
      });
    }

    // console.log("Teklifin bağlı olduğu proje ID'si:", bid.project._id.toString());

    // Teklifin bağlı olduğu projeyi al
    const project = bid.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Teklifin bağlı olduğu proje bulunamadı.",
      });
    }

    //! Eğer teklif zaten kabul edilmişse reddedilemez
    if (bid.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Bu teklif zaten kabul edildi, reddedilemez.",
      });
    }

    // Teklifin status'ünü "rejected" yap
    bid.status = "rejected";
    await bid.save();

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


module.exports = {
  createBid,
  getBidsByProject,
  updateBid,
  deleteBid,
  acceptBid,
  rejectBid,
};
