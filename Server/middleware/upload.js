// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";


// // Storage for proposals (PDF/DOCX only)
// const proposalStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "fyp-management/proposals",
//     allowed_formats: ["pdf", "docx", "doc"],
//     resource_type: "raw",
//   },
// });

// // Storage for general files (reports, code, docs)
// const fileStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const ext = file.originalname.split(".").pop().toLowerCase();
//     const imageTypes = ["png", "jpg", "jpeg", "gif", "webp"];
//     return {
//       folder: "fyp-management/files",
//       resource_type: imageTypes.includes(ext) ? "image" : "raw",
//       allowed_formats: [
//         "pdf", "docx", "doc", "zip", "rar",
//         "png", "jpg", "jpeg", "gif", "webp",
//         "py", "js", "ts", "html", "css", "txt",
//         "xlsx", "pptx", "csv",
//       ],
//     };
//   },
// });

// const fileSizeLimit = 20 * 1024 * 1024; // 20MB

// export const uploadProposal = multer({
//   storage: proposalStorage,
//   limits: { fileSize: fileSizeLimit },
//   fileFilter: (req, file, cb) => {
//     const allowed = ["application/pdf",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/msword"];
//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF and DOCX files are accepted"), false);
//     }
//   },
// }).single("proposal");

// export const uploadFile = multer({
//   storage: fileStorage,
//   limits: { fileSize: fileSizeLimit },
// }).single("file");