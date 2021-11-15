import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "./s3config";

export const imageFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  return cb(null, true);
}
  

export const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: process.env.S3_BUCKET_NAME || '',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  }),
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
  fileFilter: imageFilter,
});
