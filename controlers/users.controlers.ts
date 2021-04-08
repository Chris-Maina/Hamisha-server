import { Router, Request, Response, NextFunction } from 'express';

import { Mover, Job, User, Customer } from '../models';
import { verifyToken } from '../helpers/jwt_helpers';

const router = Router();

router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await User
      .query()
      .select('id', 'first_name', 'last_name', 'email', 'location');

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
      .select('id', 'first_name', 'last_name', 'email', 'location')
      .withGraphFetched({
        customer: true,
        mover: true,
        rooms: {
          messages: true,
          participants: true,
        }
      });

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const response = await User
      .query()
      .patch(req.body)
      .where('id', id)
      .returning(['id', 'email', 'first_name', 'last_name', 'location'])
      .withGraphFetched({
        customer: true,
        mover: true,
        rooms: {
          messages: true,
          participants: true,
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
    const response: any = await Mover
      .query()
      .orderBy('created_at', 'desc') 
      .withGraphFetched({
        account: true
      });

    res.status(200);
    res.send({
      ...response.account,
      created_at: response.created_at,
      description: response.description
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/movers/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const response = await Mover
      .query()
      .patch(req.body)
      .where('id', id)
      .returning('*')
      // .withGraphFetched({
      //   account: true
      // });

    res.status(200);
    res.send(response[0])
  } catch (error) {
    next(error);
  }
});

router.patch('/customers/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
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
