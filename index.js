const express = require("express");
const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const convertToPdf = require("docx-pdf");
const app = express();

app.use("/convert", express.static("convert"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  next();
});

function deleteFiles(inp, out) {
  fs.unlink(inp, (err) => {
    if (err) {
      console.log("Error deleting input file:", err.message);
    } else {
      console.log("Input file deleted");
    }
  });

  fs.unlink(out, (err) => {
    if (err) {
      console.log("Error deleting output file:", err.message);
    } else {
      console.log("Output file deleted");
    }
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "convert");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const convert = multer({ storage: storage });

app.post("/convert", convert.single("files"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("File not found.");
  }
  const inputPath = req.file.path;
  console.log(inputPath);
  const targetFormat = req.body.convertFileType;
  console.log(targetFormat);
  const outputPath = `convert/output.${targetFormat}`;
  console.log(outputPath);

  if (targetFormat === "pdf") {
    convertToPdf(inputPath, outputPath, function (err) {
      if (err) {
        console.error("PDF Conversion Error:", err);
        return res.status(500).send("PDF conversion failed");
      } else {
        console.log("PDF Conversion done:", outputPath);
        res.json({ filePath: `/${outputPath}` });
        setTimeout(() => {
          deleteFiles(inputPath, outputPath);
        }, 10000);
      }
    });
  } else {
    sharp(inputPath)
      .toFormat(targetFormat)
      .toFile(outputPath, (err) => {
        if (err) return res.status(500).send("Conversion failed");
        res.json({ filePath: `/${outputPath}` });
        setTimeout(() => {
          deleteFiles(inputPath, outputPath);
        }, 10000);
      });
  }
});

app.listen(6100, () => {
  console.log("Server Started...");
});
