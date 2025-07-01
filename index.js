import dotenv from "dotenv";
dotenv.config({});

import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import blogPostRoutes from "./routes/blogPostRoutes.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// For form-data (important for file uploads)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/Development/NodeJs/blog-time-to-program/tmp/",
  })
);

// Database connection
connectDB();

// Home routes
app.get("/", (_req, res) => {
  res.send({ message: "Welcome to Ridwan's Blog" });
});

// Others routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogPostRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
