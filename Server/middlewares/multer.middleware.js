import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Access the original file name using file.originalname
  },
});

const fileFilter = (req, file, cb) => {
  let ext = path.extname(file.originalname);

  if (
    ext !== ".jpg" &&
    ext !== ".jpeg" &&
    ext !== ".webp" &&
    ext !== ".png" &&
    ext !== ".mp4"
  ) {
    cb(new Error(`Unsupported file type! ${ext}`), false);
    return;
  }
  console.log("1");
  cb(null, true);
  console.log("2");
};

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  storage,
  fileFilter,
});

export default upload;
