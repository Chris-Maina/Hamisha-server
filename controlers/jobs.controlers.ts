import createHttpError from 'http-errors';
import { Router, Request, Response, NextFunction } from 'express';

import { Job } from '../models';
import { jobSchema } from '../schemas';
import { verifyToken } from '../helpers/jwt_helpers';
import { RequestWithPayload } from '../common/interfaces';

const router = Router();

router.post('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;

    const result = await jobSchema.validateAsync({
      ...req.body,
      customer_id: id
    });

    const {
      title,
      description,
      payment_amount,
      expected_duration,
      payment_type,
      customer_id
    } = result;

    const response = await Job.query()
      .insert({
        title,
        description,
        customer_id,
        payment_type,
        payment_amount,
        expected_duration,
      })
      .returning(
        ['id', 'title', 'description', 'created_at', 'expected_duration', 'payment_amount']
      )
      .withGraphFetched({
        job_type: true
      });
    res.status(201);
    res.send(response);
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest());
    next(error);
  }
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await Job.query()
      .withGraphFetched({
        job_type: true
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.patch('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;

    const response = await Job.query()
      .patch(req.body)
      .where('id', id)
      .returning(
        ['id', 'description', 'created_at', 'expected_duration', 'payment_amount']
      )
      .first()
      .withGraphFetched({
        job_type: true
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;

    const response = await Job.query()
      .update(req.body)
      .where('id', id)
      .returning(
        ['id', 'description', 'created_at', 'expected_duration', 'payment_amount']
      )
      .first()
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
