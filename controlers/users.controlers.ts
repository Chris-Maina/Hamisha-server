import { 
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import createHttpError from 'http-errors';

import { Mover, Job, User, Customer } from '../models';
import { verifyToken } from '../helpers/jwt_helpers';

const router = Router();

router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await User
      .query()
      .select('id', 'first_name', 'last_name', 'email', 'phone_number');

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const response = await User
      .query()
      .findById(id)
      .select('id', 'first_name', 'last_name', 'email', 'phone_number')
      .withGraphFetched({
        customer: {
          contracts: true,
          jobs: true
        },
        mover: {
          vehicles: true,
          contracts: true,
          proposals: true
        }
      });

    if (!response) return new createHttpError.NotFound("User does not exist");

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.query().findById(id);
    if (!user) return new createHttpError.NotFound("User does not exist.");

    const response = await User
      .query()
      .patch(req.body)
      .where('id', id)
      .returning(['id', 'email', 'first_name', 'last_name', 'phone_number'])
      .withGraphFetched({
        customer: true,
        mover: {
          vehicles: true
        }
      });

    res.status(200);
    res.send(response[0])
  } catch (error) {
    next(error);
  }
});

router.get('/movers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: any[] = await Mover
      .query()
      .orderBy('created_at', 'desc') 
      .withGraphFetched({
        account: true
      });

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.patch('/movers/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const mover = await Mover.query().findById(id);
    if (!mover) return new createHttpError.NotFound("User does not exist. Register as a collector");

    const response = await Mover
      .query()
      .patch(req.body)
      .where('id', id)
      .returning('*')

    res.status(200);
    res.send(response[0])
  } catch (error) {
    next(error);
  }
});

router.patch('/customers/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await Customer.query().findById(id);
    if (!customer) return new createHttpError.NotFound("User does not exist. Register as a landlord");

    const response = await Customer
      .query()
      .patch(req.body)
      .where('id', id)
      .returning('*')
      // .withGraphFetched({
      //   account: true
      // });

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
});

router.get('/customers/:id/jobs', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const customer = await Customer.query().findById(req.params.id);
    if (!customer) return new createHttpError.NotFound("User does not exist. Register as a landlord.");

    const response: any = await Job
      .query()
      .where({ customer_id: parseInt(req.params.id, 10) })
      .orderBy('created_at', 'desc')
      .withGraphFetched({
        job_type: true
      });

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;
