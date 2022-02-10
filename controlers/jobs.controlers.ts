import createHttpError from 'http-errors';
import { Router, Request, Response, NextFunction } from 'express';

import { Customer, Job } from '../models';
import { jobSchema } from '../schemas';
import { verifyToken } from '../helpers/jwt_helpers';
import { RequestWithPayload } from '../common/interfaces';

const router = Router();

router.post('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;

    const result = await jobSchema.validateAsync(req.body);

    const {
      collection_date,
      expected_duration,
      location
    } = result;

    const customer = await Customer.query().findOne({ user_id: id });
    if (!customer) throw new createHttpError.NotFound('Register as a customer to create jobs');

    const response = await Job.query()
      .insert({
        location,
        collection_date,
        customer_id: customer.id,
        expected_duration,
      })
      .returning(
        ['id', 'location', 'created_at', 'expected_duration', 'collection_date']
      );
    res.status(201);
    res.send(response);
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await Job
      .query()
      .orderBy('created_at', 'desc')
      .withGraphFetched({
        proposals: true,
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});


router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Job
      .query()
      .findById(id)
      .withGraphFetched({
        customer: {
          account: true,
        },
        proposals: {
          mover: {
            account: true,
          },
          contract: true
        },
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Job.query()
      .patch(req.body)
      .where('id', id)
      .returning(
        ['id', 'location', 'created_at', 'expected_duration', 'collection_date']
      )
      .first()
      .withGraphFetched({
        proposals: true,
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Job.query()
      .update(req.body)
      .where('id', id)
      .returning(
        ['id', 'location', 'created_at', 'expected_duration', 'collection_date']
      )
      .first()
      .withGraphFetched({
        proposals: true,
      });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => { 
  const { id } = req.params;
  try {
    await Job.query().deleteById(id);

    res.status(200);
    res.send({ message: 'Successfully deleted the job'});
  } catch (error) {
    next(error);
  }
});

export default router;
