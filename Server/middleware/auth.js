import jwt from "jsonwebtoken";
import Student from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
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
      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role-based access
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const supervisorOnly = (req, res, next) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Supervisor access only" });
  }
  next();
};

export const studentOnly = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

export const adminOrSupervisor = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};