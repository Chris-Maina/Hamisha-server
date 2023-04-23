import createHttpError from 'http-errors';
import { Response, Router, Request, NextFunction } from 'express';

import { USER_TYPES } from '../common/constants';
import { User, Mover, Customer, Vehicle } from '../models';
import { registerSchema, loginSchema, moverRegisterSchema } from '../schemas';
import { RequestWithPayload, S3UploadedObject } from '../common/interfaces';
import {
  verifyToken,
  generateToken,
  verifyRefreshToken,
  generateRefreshToken,
} from '../helpers/jwt_helpers';
import { upload } from "../multer";
import { uploadFile } from '../s3config';
import { unlinkFile } from '../helpers/unlinkFileHelper';
import { sendCustomerIntroMail } from '../daemons/mail.daemon';
import { getResizeDestnFileLoc, resizeFormatImageToWebp } from '../helpers/image_helpers';

const router = Router();

router.post('/register', upload.single('vehicle_pic'), async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = req.body.type === USER_TYPES.CUSTOMER ? 
      await registerSchema.validateAsync(req.body) 
    : await moverRegisterSchema.validateAsync(req.body);
    
    const {
      email,
      password,
      first_name,
      last_name,
      type,
      description,
      phone_number,
      reg_number,
      vehicle_type
    } = result;

    const userExists = await User.query().findOne({ email });
    if (userExists) throw new createHttpError.Conflict(`${email} has already been taken`);

    const hashedPassword = await User.hashPassword(password);
    const response = await User
      .query()
      .returning(
        ['id', 'first_name', 'last_name', 'email', 'phone_number']
      )
      .insert({
        email,
        role: type,
        last_name,
        first_name,
        phone_number,
        password: hashedPassword
      });

    const userObj: {[key: string]: any} = {
      id: response.id,
      email: response.email,
      last_name: response.last_name,
      first_name: response.first_name,
    };

    if (type === USER_TYPES.CUSTOMER) {
      // add to customers table
      await Customer.query().insert({
        user_id: response.id,
      });

      // send introduction mail
      await sendCustomerIntroMail(response.first_name, response.email);
    } else {
      // add to movers table
      const mover = await Mover.query().insert({
        user_id: response.id,
        description
      });

      userObj['mover_id'] = mover.id;
      if (reg_number && req.file) {
        const vehicleExists = await Vehicle.query().findOne({ reg_number });
        if (vehicleExists) throw new createHttpError.Conflict(`Vehicle with ${reg_number} has already been registered`);

        // Resize image and convert to webp format
        await resizeFormatImageToWebp(req.file.path, req.file.filename);

        // Upload file
        const resizeFileLoc: string = getResizeDestnFileLoc(req.file.filename);
        const uploadedFile: S3UploadedObject = await uploadFile(resizeFileLoc, req.file.filename);
        
        // Unlike file from multer and resized image sharp
        unlinkFile(req.file.path);
        unlinkFile(resizeFileLoc);

        // add to vehicles table
        await Vehicle.query().insert({
          reg_number,
          vehicle_type,
          mover_id: mover.id,
          vehicle_pic: uploadedFile.Key,
        });
      }
    }

    res.status(201);
    res.send(userObj);
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginSchema.validateAsync({ email: req.body.email, password: req.body.password });
    const { email, password } = result;

    const user = await User
      .query()
      .findOne({ email })
      .withGraphFetched({
        customer: true,
        mover: {
          vehicles: true
        },
      });
    
    if (!user) throw new createHttpError.NotFound(`User is not registered`);

    const isPasswordValid = await User.validatePassword(password, user.password);
    if (!isPasswordValid) throw new createHttpError.Unauthorized("Provide a valid password.");

    const token = await generateToken(user.id);
    await generateRefreshToken(user.id, res);

    res.status(200);

    return res.send({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      customer: user.customer,
      mover: user.mover,
      access_token: token,
    });
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest('Provide a valid email/password.'));
    next(error);
  }
});

router.get('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieArr = req.headers.cookie?.split('=');
    if (!cookieArr) throw new createHttpError.NotFound('Token unavailable. Please login');

    const refreshTokenIndex = cookieArr.findIndex(el => el.includes('refreshToken'));
    if (refreshTokenIndex === -1) throw new createHttpError.NotFound('Token unavailable. Please login');
    const refresh_token = cookieArr[refreshTokenIndex + 1];
    const payload = await verifyRefreshToken(refresh_token);

    const token = await generateToken(payload.id);
    await generateRefreshToken(payload.id, res);
    res.status(201);
    res.send({ access_token: token });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const { email, password } = result;

    const userQuery = User.query();
    const user = await userQuery
      .findOne({ email })
      .withGraphFetched({
        customer: true,
        mover: true
      });
    if (!user) throw new createHttpError.NotFound('User is not registered');

    const hashedPassword = await User.hashPassword(password);
    userQuery.findById(user.id).patch({ password: hashedPassword });

    res.status(200);
    return res.send({
      message: "Successfully updated password, login.",
    })
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest('Provide a valid email/password.'));
    next(error);
  }
});

// Gets logged in user resource
router.get('/profile', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const response = await User
      .query()
      .findById(id)
      .select('id', 'first_name', 'last_name', 'email', 'phone_number')
      .withGraphFetched({
        customer: {
          jobs: true
        },
        mover: {
          vehicles: true
        }
      });

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
})

export default router;