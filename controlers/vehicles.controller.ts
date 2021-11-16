
import { Router, NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import type { Readable } from 'stream';
import { upload } from "../multer";
import Vehicle from "../models/Vehicle";
import { getFileStream, uploadFile } from "../s3config";
import { S3UploadedObject } from "../common/interfaces";

const router = Router();

router.post('/', upload.single('vehicle_pic'), async (req: any, res: Response, next: NextFunction) => {

  try {
    if (req.fileValidationError) {
      throw new createHttpError.BadRequest(req.fileValidationError);
    } else if (!req.file) {
      throw new createHttpError.BadRequest("Please select an image to upload");
    } else {
      const { mover_id, reg_number, vehicle_type } = req.body;

      const vehicleExists = await Vehicle.query().findOne({ reg_number });
      if (vehicleExists) throw new createHttpError.Conflict(`Vehicle with ${reg_number} has already been registered`);
  
      // upload file
      const uploadedFile: S3UploadedObject = await uploadFile(req.file);
      // save file path in DB
      const response = await Vehicle.query().insert({
        mover_id: parseInt(mover_id, 10),
        reg_number,
        vehicle_type,
        vehicle_pic: uploadedFile.Key,
      });

      res.status(201);
      return res.send(response);
    }
  } catch (error) {
    next(error)
  }
});

router.patch('/', upload.single('vehicle_pic'), async (req: any, res: Response, next: NextFunction) => {

  try {
    if (req.fileValidationError) {
      throw new createHttpError.BadRequest(req.fileValidationError);
    } else if (!req.file) {
      throw new createHttpError.BadRequest("Please select an image to upload");
    } else {
      const { reg_number, vehicle_type } = req.fields;

      const vehicleExists = await Vehicle.query().findOne({ reg_number });
      if (!vehicleExists) throw new createHttpError.NotFound(`Vehicle has not been registered`);

      // save file path in DB
      const response = await Vehicle.query()
      .patch({
        vehicle_type,
        vehicle_pic: req.file.location,
      })
      .where('reg_number', reg_number)
      .returning(['reg_number', 'vehicle_type', 'vehicle_pic'])
      .first();

      res.status(200);
      return res.send(response);
    }
  } catch (error) {
    next(error)
  }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.key) throw new createHttpError.BadRequest("Please provide the vehicle_pic");
    const readStream: Readable = getFileStream(req.params.key);

    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
})

export default router;
