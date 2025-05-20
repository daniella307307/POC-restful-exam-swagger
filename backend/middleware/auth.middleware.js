// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const db = require("../models/relations");
const User = db.User;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).send({ message: "Unauthorized!" });
    }
    console.log("Decoded token:", decoded);
    req.userId = decoded.id;
    req.userRole = decoded.role; // Assuming you put role in JWT payload
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    console.log("User found:", user);
    if (user && user.role.trim().toLowerCase() === "admin") {
      next();
      return;
    }
    console.log("Checking admin role for:", user?.role);

    console.log("Access denied for role:", user?.role);
    res.status(403).send({ message: "Require Admin Role!" });
  } catch (error) {
    console.error("Role validation error:", error);
    res.status(500).send({ message: "Unable to validate User role!" });
  }
};

const isUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && (user.role === "user" || user.role === "admin")) {
      // Admin can also be a user
      next();
      return;
    }
    res.status(403).send({ message: "Require User Role!" });
  } catch (error) {
    res.status(500).send({ message: "Unable to validate User role!" });
  }
};

module.exports = { verifyToken, isAdmin, isUser };
