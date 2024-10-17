const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "text/csv", // CSV files
    "application/vnd.ms-excel", // XLS files
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX files
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e1);
    cb(null, file.fieldname + "-" + uniqueSuffix + "12.png");
  },
});

const Upload = multer({ storage: storage, fileFilter: fileFilter });
// const Upload = multer({ storage: storage });

module.exports = Upload;
