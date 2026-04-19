// ════════════════════════════════════════════════════════════
//  config/cloudinary.js  —  Cloudinary + Multer setup
// ════════════════════════════════════════════════════════════
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage: uploads PDFs to "fyp-portal/cvs" folder on Cloudinary
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:        'fyp-portal/cvs',
    resource_type: 'raw',           // required for non-image files like PDFs
    public_id: (req, file) => {
      const clean = file.originalname
        .replace(/\.pdf$/i, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      return `cv_${Date.now()}_${clean}`;
    },
  },
});

// Multer middleware — only PDFs, max 5MB
const uploadCV = multer({
  storage: cvStorage,
  limits:  { fileSize: 5 * 1024 * 1024 },   // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, uploadCV };