const multer = require('multer');
const path = require('path');

// Storage config for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: function (req, file, cb) {
    // DoctorId and name should be in req.body
    const { id, name, type } = req.body;
    let suffix = file.fieldname === 'photo' ? '_photo' : '_sign';
    // Clean name for filename
    const safeName = name ? name.replace(/\s+/g, '_') : 'unknown';
    cb(null, `${id}_${safeName}${suffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
