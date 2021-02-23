import createHttpError from 'http-errors';
import { Response, Router, Request, NextFunction } from 'express';

import { USER_TYPES } from '../common/constants';
import { User, Mover, Customer } from '../models';
import { registerSchema, loginSchema } from '../schemas';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '../helpers/jwt_helpers';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerSchema.validateAsync(req.body);
    const { email, password, first_name, last_name, type, location, description } = result;

    const userExists = await User.query().findOne({ email });
    if (userExists) throw new createHttpError.Conflict(`${email} has already been taken`);

    const hashedPassword = await User.hashPassword(password);
    const response = await User
      .query()
      .returning(
        ['id', 'first_name', 'last_name', 'email',   'location']
      )
      .insert({
        email,
        last_name,
        first_name,
        location,
        password: hashedPassword
      });

    if (type === USER_TYPES.CUSTOMER) {
      // add to customers table
      await Customer.query().insert({
        user_id: response.id,
      })
    } else {
      // add to movers table
      await Mover.query().insert({
        user_id: response.id,
        description
      })
    }

    res.status(201);
    res.send({
      id: response.id,
      email: response.email,
      last_name: response.last_name,
      first_name: response.first_name,
      location: response.location
    });
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest());
    next(error);
  }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const { email, password } = result;

    const user = await User
      .query()
      .findOne({ email });
    
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
      access_token: token,
    });
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest('Provide a valid email/password.'));
    next(error);
  }
});

router.get('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieArr = req.headers.cookie?.split('=');
    if (!cookieArr) throw new createHttpError.NotFound('Token not available');

    const refreshTokenIndex = cookieArr.findIndex(el => el.includes('refreshToken'));
    const refresh_token = cookieArr[refreshTokenIndex + 1];
    const userId = await verifyRefreshToken(refresh_token);

    const token = await generateToken(userId);
    await generateRefreshToken(userId, res);
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
    const user = await userQuery.findOne({ email });
    if (!user) throw new createHttpError.NotFound('User is not registered');

    const hashedPassword = await User.hashPassword(password);
    userQuery.findById(user.id).patch({ password: hashedPassword });

    const token = await generateToken(user.id);
    const newRefreshToken = await generateRefreshToken(user.id, res);

    res.status(200);
    return res.send({
      message: "Successfully updated password",
      access_token: token,
      refresh_token: newRefreshToken
    })
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest('Provide a valid email/password.'));
    next(error);
  }
});

export default router;