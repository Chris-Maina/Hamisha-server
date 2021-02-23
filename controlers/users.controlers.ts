import { Router, Request, Response, NextFunction } from 'express';

import { Mover } from '../models';
import { RequestWithPayload } from '../common/interfaces';

const router = Router();

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
    })
  } catch (error) {
    next(error);
  }
});

router.patch('/movers', async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const response = await Mover
      .query()
      .patch(req.body)
      .where('user_id', id)
      .withGraphFetched({
        account: true
      });

    res.status(200);
    res.send(response)
  } catch (error) {
    next(error);
  }
});

export default router;
