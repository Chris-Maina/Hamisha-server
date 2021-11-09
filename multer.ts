import multer from "multer";
import path from "path";

/**
 * 
 * @param category - string. Category associated with the image stored 
 * e.g vehicles, profile pics
 * @returns storage configuration
 */
export const storage = (category: string) => multer.diskStorage({
  destination: `./public/images/${category}`,
  // By default, multer removes file extensions so let's add them back
  filename: function (_req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});

export const imageFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  return cb(null, true);
}
  
export const IMAGE_CATEGORIES = {
  VEHICLES: 'vehicles'
}

export const upload = multer({
  storage: storage(IMAGE_CATEGORIES.VEHICLES),
  fileFilter: imageFilter,
});
