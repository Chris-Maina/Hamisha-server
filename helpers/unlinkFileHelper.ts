import { unlink } from "fs";
import { promisify } from "util";

// Deletes file from provided path
export const unlinkFile = promisify(unlink);
