import createHttpError from 'http-errors';
import { Router, Request, Response, NextFunction } from 'express';

import { Customer, Job } from '../models';
import { jobSchema } from '../schemas';
import { verifyToken } from '../helpers/jwt_helpers';
import { RequestWithPayload } from '../common/interfaces';

const router = Router();
const JobReturningFields: string[] = ['id', 'location', 'created_at', 'collection_day', 'end_date', 'start_date', 'quantity'];
router.post('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;

    const result = await jobSchema.validateAsync(req.body);

    const {
      collection_day,
      location,
      start_date,
      end_date,
      quantity
    } = result;

    const customer = await Customer.query().findOne({ user_id: id });
    if (!customer) throw new createHttpError.NotFound('Register as a landlord to create requests');

    const response = await Job.query()
      .insert({
        location,
        quantity,
        end_date,
        start_date,
        collection_day,
        customer_id: customer.id,
      })
      .returning(JobReturningFields);
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
    
    if (!response) throw new createHttpError.NotFound("Job does not exist.");

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await Job.query().findById(id);
    if (!job) throw new createHttpError.NotFound("Job does not exist.");

    const response = await Job.query()
      .patch(req.body)
      .where('id', job.id)
      .returning(JobReturningFields)
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

    const job = await Job.query().findById(id);
    if (!job) throw new createHttpError.NotFound("Job does not exist.");

    const response = await Job.query()
      .update(req.body)
      .where('id', id)
      .returning(JobReturningFields)
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
