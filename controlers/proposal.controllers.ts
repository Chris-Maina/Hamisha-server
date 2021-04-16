import createHttpError from "http-errors";
import { NextFunction, Response, Router, Request } from "express";

import { Proposal } from "../models";
import { proposalSchema } from "../schemas";
import { ProposalAttr } from "../common/interfaces";
import { verifyToken } from "../helpers/jwt_helpers";
import { PROPOSAL_STATUS } from "../common/constants";

const router = Router();

router.get('/', verifyToken, (req: Request, res: Response, next: NextFunction) => {

});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const result: ProposalAttr = await proposalSchema.validateAsync(req.body);

    const {
      job_id,
      mover_id,
      payment_type,
      payment_amount,
    } = result;

    const hasSubmitted = await Proposal.query()
      .where('job_id', job_id)
      .where('mover_id', mover_id);

    if (hasSubmitted.length) throw new createHttpError.Conflict('You have already submitted a proposal for this job');

    const response: ProposalAttr = await Proposal.query()
      .insert({
        job_id,
        mover_id,
        payment_type,
        payment_amount,
        status: PROPOSAL_STATUS.SENT
      });

      res.status(201);
      res.send(response);
  } catch (error) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

router.patch("/:id", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Find proposal with id
    const proposal = await Proposal.query().findById(id);
    if (!proposal) throw new createHttpError.NotFound("Proposal does not exist");

    // Update
    const response: any = await Proposal
      .query()
      .patch(req.body)
      .where("id", id)
      .returning(['id', 'status', 'payment_amount', 'created_at']);

    res.status(200);
    res.send(response[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
