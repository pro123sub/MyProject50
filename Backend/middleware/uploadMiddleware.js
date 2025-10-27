const multer = require("multer");
const path = require("path");

// Allowed MIME types
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png"
];

// Multer Storage (temp storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp"); // store only temporarily
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

// File Filter for validation
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
};

// Max file size = 10MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  }
});

module.exports = upload;
