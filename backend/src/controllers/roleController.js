const ROLES = require("../constants/roles");

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bu işlem için yetkiniz bulunmuyor!" });
    }

    next();
  };
};

module.exports = { checkRole };