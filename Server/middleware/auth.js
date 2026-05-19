import jwt from "jsonwebtoken";
import Student from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
import Admin from "../Models/admin.js";

export const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in any of the 3 collections
    let user = null;
    let role = null;

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
      role = "admin";
    } else if (decoded.role === "supervisor" || decoded.role === "chairman") {
      user = await Supervisor.findById(decoded.id).select("-password");
      role = decoded.role;
    } else {
      user = await Student.findById(decoded.id).select("-password");
      role = "student";
    }

    // Fallback: if role wasn't in token, check all 3 collections
    if (!user) {
      user = await Admin.findById(decoded.id).select("-password");
      if (user) role = "admin";
      else {
        user = await Supervisor.findById(decoded.id).select("-password");
        if (user) role = "supervisor";
        else {
          user = await Student.findById(decoded.id).select("-password");
          if (user) role = "student";
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = {
      id:           user._id.toString(),
      role:         role,
      name:         user.name,
      email:        user.email,
      student_code: user.student_code,
      sup_code:     user.sup_code,
      is_chairman:  user.is_chairman || false,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
// ── Role-based access ──────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ✅ Allow both supervisors AND chairmen
export const supervisorOnly = (req, res, next) => {
  if (req.user.role !== "supervisor" && req.user.role !== "chairman") {
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
  if (
    req.user.role !== "admin" &&
    req.user.role !== "supervisor" &&
    req.user.role !== "chairman"
  ) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export const chairmanOnly = (req, res, next) => {
  if (req.user.role !== "chairman") {
    return res.status(403).json({ message: "Chairman access only" });
  }
  next();
};
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin" || req.admin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};