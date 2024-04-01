import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { createReadStream, unlinkSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Define __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file has been uploaded");
  }

  const results = [];
  const filePath = join(__dirname, "..", req.file.path); // Adjust according to your directory structure
  createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      unlinkSync(filePath); // Delete the uploaded file after parsing
      res.status(200).json({ data: results });
    })
    .on("error", (error) => {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    });
});

export default router;
