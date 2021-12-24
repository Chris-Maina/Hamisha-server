import multer from "multer";
import { FILE_DEST } from "./common/constants";

const storage = multer.diskStorage({
  destination: FILE_DEST,
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '_' + uniqueSuffix);
  }
});

export const imageFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  return cb(null, true);
}
  

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
  fileFilter: imageFilter,
});
