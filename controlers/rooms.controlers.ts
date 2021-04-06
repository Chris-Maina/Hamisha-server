import { Router, Request, Response, NextFunction } from 'express';
import { Room } from '../models';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await Room
    .query()
    .withGraphFetched({
      participants: {
        user: true
      },
    });
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;
