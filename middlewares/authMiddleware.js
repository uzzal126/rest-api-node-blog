import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

// Middleware to check if the user is an admin
export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    if (user.role !== "admin") {
      return res
        .status(403)
        .send("You are not authorized to access this resource.");
    } else {
      next();
    }
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
