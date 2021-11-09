
import { Router, NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { upload } from "../multer";
import Vehicle from "../models/Vehicle";

const router = Router();

router.post('/', upload.single('vehicle_pic'), async (req: any, res: Response, next: NextFunction) => {

  try {
    if (req.fileValidationError) {
      throw new createHttpError.BadRequest(req.fileValidationError);
    } else if (!req.file) {
      throw new createHttpError.BadRequest("Please select an image to upload");
    } else {
      const { reg_number, vehicle_type } = req.fields;
      const { mover_id } = req.body;

      const vehicleExists = await Vehicle.query().findOne({ reg_number });
      if (vehicleExists) throw new createHttpError.Conflict(`Vehicle with ${reg_number} has already been registered`);
  
      // save file path in DB
      const response = await Vehicle.query().insert({
        mover_id,
        reg_number,
        vehicle_type,
        vehicle_pic: req.file.path,
      });

      res.status(201);
      return res.send({ message: `Successfully uploaded vehicle ${response} picture` });
    }
  } catch (error) {
    next(error)
  }
});

export default router;
