const User = require("../models/User");
const Project = require("../models/Project");
const Bid = require("../models/Bid");

//countDocuments kullanma nedenimiz kaç adet varsa görmek istememiz
const getGeneralStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFreelancers = await User.countDocuments({ role: "freelancer" });
    const totalEmployers = await User.countDocuments({ role: "employer" });

    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: "open" });
    const inProgressProjects = await Project.countDocuments({ status: "in-progress" });
    const completedProjects = await Project.countDocuments({ status: "completed" });

    const totalBids = await Bid.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFreelancers,
        totalEmployers,
        totalProjects,
        openProjects,
        inProgressProjects,
        completedProjects,
        totalBids,
      },
    });
  } catch (error) {
    console.error("Genel istatistikler alınırken hata:", error);
    res.status(500).json({ success: false, message: "Genel istatistikler alınamadı." });
  }
};


module.exports = { getGeneralStats };
