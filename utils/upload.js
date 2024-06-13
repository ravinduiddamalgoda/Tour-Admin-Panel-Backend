const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'ChatFiles/');
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const storagePDF = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'PaymentPDF/');
    },
    filename: function (req, file, cb) {
      let ext = path.extname(file.originalname);
      cb(null, Date.now() + ext);
    }
  });

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const allowedExtensions = [
      // Image MIME types
      'image/jpeg',
      'image/png',
      'image/gif',
      // PDF MIME type
      'application/pdf'
    ]; 
    if (allowedExtensions.includes(file.mimetype)) {
      callback(null, true);
    } else {
      console.log('Only JPEG, PNG, GIF and PDF files are supported');
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB file size limit (adjust as needed)
  }
});

const uploadPDF = multer({
    storage: storagePDF,
    fileFilter: function (req, file, callback) {
      const allowedExtensions = [
        'application/pdf'
      ]; 
      if (allowedExtensions.includes(file.mimetype)) {
        callback(null, true);
      } else {
        console.log('Only JPEG, PNG, GIF and PDF files are supported');
        callback(null, false);
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 20 // 20MB file size limit (adjust as needed)
    }
  });

module.exports = {
    upload,
    uploadPDF
}; 