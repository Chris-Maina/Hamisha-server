import createHttpError from "http-errors";
import { NextFunction, Response, Router, Request } from "express";

import { Job, Mover, Proposal } from "../models";
import { proposalSchema } from "../schemas";
import { JOB_STATUS, ProposalAttr, RequestWithPayload } from "../common/interfaces";
import { verifyToken } from "../helpers/jwt_helpers";
import { PROPOSAL_STATUS } from "../common/constants";

const router = Router();
const PROPOSAL_FIELDS = ['id', 'status', 'payment_amount', 'created_at', 'mover_id', 'payment_type'];

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const mover = await Mover.query().findOne({ user_id: id });

    if (!mover) return new createHttpError.Unauthorized("Please login to access resource")
    const response = await Proposal
      .query()
      .where("mover_id", mover.id)
      .orderBy('created_at', 'desc')
      .withGraphFetched({
        mover: {
          account: true,
        },
        job: true
      });

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const result: ProposalAttr = await proposalSchema.validateAsync(req.body);

    const {
      job_id,
      mover_id,
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
        payment_amount,
        status: PROPOSAL_STATUS.SENT
      })
      .returning(PROPOSAL_FIELDS)
      .withGraphFetched({
        mover: {
          account: true,
        },
      });

      res.status(201);
      res.send(response);
  } catch (error: any) {
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

    let response: any;
    // Update
    if (req.body.status === PROPOSAL_STATUS.ACCEPTED && proposal.status !== PROPOSAL_STATUS.ACCEPTED) {
      const promiseArray = await Promise.all([
        Proposal
          .query()
          .patch(req.body)
          .where("id", id)
          .returning(PROPOSAL_FIELDS)
          .first()
          .withGraphFetched({
            mover: {
              account: true,
            },
          }),
        Job.query().patch({ status: JOB_STATUS.INPROGRESS }).where("id", proposal.job_id)
      ]);
      response = promiseArray[0];
    } else {
      response = await Proposal
        .query()
        .patch(req.body)
        .where("id", id)
        .returning(PROPOSAL_FIELDS)
        .first()
        .withGraphFetched({
          mover: {
            account: true,
          },
        });
    }

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;
