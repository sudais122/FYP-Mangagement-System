export const isChairman = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (req.user.is_chairman !== true) {
    return res.status(403).json({
      message: "Chairman access required",
    });
  }

  next();
};