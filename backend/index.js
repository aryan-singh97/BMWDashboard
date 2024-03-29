// index.js
import express from "express";
import { PORT } from "./config.js";
import multer from "multer";
import csvParser from "csv-parser";
import { createReadStream, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path"; // Import path module to handle file paths

const app = express();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Directory where files will be uploaded
  },
  filename: (req, file, cb) => {
    // Generate a unique file name to avoid conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Received file:", req.file);
    if (!req.file) {
      return res.status(400).send("No file has been uploaded");
    }

    const results = [];
    // Get the directory name of the current module
    const __filename = fileURLToPath(import.meta.url);
    const uploadDir = dirname(__filename);
    const filePath = path.join(uploadDir, req.file.path); // Construct absolute file path
    console.log("File path:", filePath);
    createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        unlinkSync(filePath); // Delete the uploaded file after parsing
        res.status(200).json({ data: results });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Encountered an Issue!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
