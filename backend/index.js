// index.js
import express from "express";
import { PORT } from "./config.js";
import multer from "multer";
import csvParser from "csv-parser";
import fs, { createReadStream, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import path, { dirname, join, basename } from "path";

import cors from "cors";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type",
  })
);
// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { fileId, chunkIndex } = req.body;
    fileId && chunkIndex !== undefined
      ? cb(null, "./uploads")
      : cb(null, "./uploads"); // Directory where files will be uploaded
  },
  filename: (req, file, cb) => {
    const { fileId, chunkIndex } = req.body;
    fileId && chunkIndex !== undefined
      ? cb(null, `${fileId}-${chunkIndex}`)
      : cb(null, `${Date.now()}-${file.originalname}`);
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
        // unlinkSync(filePath); // Delete the uploaded file after parsing
        res.status(200).json({ data: results });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to handle chunk uploads
app.post("/uploadChunk", upload.single("file"), async (req, res) => {
  const { fileId, chunkIndex, totalChunks, originalFileName } = req.body;

  // Directory to store the chunks
  const chunksDir = join(__dirname, "uploads/temp", fileId);
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  // Rename and move the chunk to the dedicated directory
  const chunkName = `${chunkIndex}`;
  const chunkPath = join(chunksDir, chunkName);
  fs.renameSync(req.file.path, chunkPath);

  // Check if all chunks have been uploaded
  const uploadedChunks = fs.readdirSync(chunksDir).length;
  const timestampedFileName = `${Date.now()}-${basename(originalFileName)}`;
  if (uploadedChunks == totalChunks) {
    // Once all chunks are uploaded, combine them
    const filePath = join(__dirname, "uploads", basename(timestampedFileName));

    const fileStream = fs.createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = fs.readFileSync(join(chunksDir, `${i}`));
      fileStream.write(chunk);
      fs.unlinkSync(join(chunksDir, `${i}`)); // Delete chunk after merging
    }

    fileStream.end();
    fileStream.on("finish", () => {
      console.log(`File reassembled: ${filePath}`);
      res.json({ message: "File uploaded and assembled successfully" });

      // Remove the chunks directory after successful reassembly
      try {
        fs.rmSync(chunksDir, { recursive: true, force: true });
        console.log(`Temporary chunks directory removed: ${chunksDir}`);
      } catch (err) {
        console.error(`Error removing temporary chunks directory: ${err}`);
      }
    });
  } else {
    res.json({ message: `Received chunk ${chunkIndex + 1} of ${totalChunks}` });
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
