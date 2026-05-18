import jwt from "jsonwebtoken";
import Settings from "../Models/Maintaince.js";
import Admin from "../Models/admin.js";


export const maintenanceGuard = async (req, res, next) => {
  try {
    // Always allow the maintenance status check (public endpoint)
    if (req.path === "/admin/maintenance" && req.method === "GET") {
      return next();
    }

    const settings = await Settings.findOne();
    if (!settings || !settings.maintenance_mode) {
      return next();
    }

    // Maintenance is ON — check if user is admin via JWT
    let isAdmin = false;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        if (decoded.role === "admin") {
          isAdmin = true;
        } else {
          // Fallback: lookup admin by id (in case role isn't in token)
          const admin = await Admin.findById(decoded.id);
          if (admin) isAdmin = true;
        }
      } catch {
        // Invalid token — treated as non-admin
      }
    }

    if (isAdmin) {
      return next();
    }

    // Block non-admin users with 503
    return res.status(503).json({
      message: "System under maintenance",
      maintenance_mode: true,
      maintenance_reason: settings.maintenance_reason,
      maintenance_started_at: settings.maintenance_started_at,
    });
  } catch (err) {
    console.error("Maintenance guard error:", err);
    next(); // Fail-open: don't block on errors
  }
};