import jwt from "jsonwebtoken";
import Admin from "../Models/admin.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role,
        is_chairman: decoded.is_chairman || false
      };

      next();

    } catch (error) {
      return res.status(401).json({ message: "Token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

export const adminOnly = (req, res, next) => {

  if (
    req.user &&
    req.user.role === "admin"
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Admin privileges required."
    });
  }

};