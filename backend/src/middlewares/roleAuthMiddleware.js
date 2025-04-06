const ROLES = require("../constants/roles.js");

const checkRole = (...roles) => {
  return (req, res, next) => {
    //Kullanıcıyı doğrulayalım.
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    //Admin kontrolünü yapalım
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }
    //Rol kontrolü
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bu işlem için yetkiniz bulunmuyor." });
    }
    //izin verilen kullanıcyla devammm
    next();
  };
};

module.exports = { checkRole };
