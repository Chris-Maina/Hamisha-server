import sharp from "sharp";
import { FILE_DEST } from "../common/constants";

export const getResizeDestnFileLoc = (filename: string) => `${FILE_DEST}/${filename}.webp`;

export function resizeFormatImageToWebp(filePath: string, filename: string): Promise<sharp.OutputInfo> {
  const destnFileLoc: string = getResizeDestnFileLoc(filename);
  return sharp(filePath).resize({
    width: 265,
    height: 184
  }).toFormat("webp", {
    lossless: true,
    quality: 20
  }).toFile(destnFileLoc);
}
