import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import {
  Contract,
  Job,
  Proposal,
  User
} from "../models";
import { contractSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { CONTRACT_STATUS } from "../common/constants";
import { JOB_STATUS, RequestWithPayload } from "../common/interfaces";

const router = Router();
const contractFields: string[] = [
  'id', 'start_time', 'title', 'status', 'proposal_id', 'mover_id'
];

const updateProposalFromContract = async (contract: any): Promise<number | void | unknown []> => {
  if (contract.status === CONTRACT_STATUS.DECLINED) {
    const proposal = await Proposal
      .query()
      .findById(contract.proposal_id);
    return Job
      .query()
      .findById(proposal.job_id)
      .patch({ status: JOB_STATUS.COMPLETED })
      .whereNot('status', JOB_STATUS.COMPLETED);
  } else if (contract.status === CONTRACT_STATUS.CLOSED) {
    const proposal = await Proposal
      .query()
      .findById(contract.proposal_id);
    return await Job
      .query()
      .findById(proposal.job_id)
      .patch({ status: JOB_STATUS.COMPLETED })
      .whereNot('status', JOB_STATUS.COMPLETED);
  }
  return;
}

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    const user = await User
      .query()
      .findById(id)
      .withGraphFetched({
        mover: true,
        customer: true,
      });
    let response = null;

    if (user.customer) {
      response = await Contract
        .query()
        .where('customer_id', user.customer.id)
        .orderBy('created_at', 'desc')
        .withGraphFetched({
          mover: {
            account: true
          },
          customer: true,
          proposal: true,
        });
    } else {
      response = await Contract
        .query()
        .where('mover_id', user.mover.id)
        .orderBy('created_at', 'desc')
        .withGraphFetched({
          customer: {
            account: true
          },
          proposal: true,
        });;
    }

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contractSchema.validateAsync(req.body);

    // Check if contract is unique
    const contractExists: any = await Contract.query().findOne({
      customer_id: result.customer_id,
      mover_id: result.mover_id,
      proposal_id: result.proposal_id
    });
    if (contractExists
      && (
        contractExists.status !== CONTRACT_STATUS.CLOSED || 
        contractExists.status !== CONTRACT_STATUS.DECLINED
      )
    ) throw new createHttpError.Conflict("A contract exists between shared contacts");

    const response = await Contract
      .query()
      .insert(result)
      .returning(contractFields)
      .withGraphFetched({
        mover: {
          account: true
        },
        customer: true,
        proposal: true,
      });

    updateProposalFromContract(response);
  
    res.status(201);
    res.send(response);
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

router.patch('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response: any = await Contract
      .query()
      .patch(req.body)
      .where('id', id)
      .returning(contractFields)
      .first()
      .withGraphFetched({
        mover: {
          account: true
        },
        customer: true,
        proposal: true,
      });

    updateProposalFromContract(response);
    
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const response = await Contract
      .query()
      .update(req.body)
      .where('id', id)
      .returning(contractFields)
      .first()
      .withGraphFetched({
        mover: {
          account: true
        },
        customer: true,
        proposal: true,
      });

    updateProposalFromContract(response);

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await Contract.query().deleteById(id);

    res.status(200);
    res.send({ message: 'Successfully deleted the contract' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const response = await Contract
      .query()
      .findById(id)
      .withGraphFetched({
        mover: {
          account: true
        },
        customer: {
          account: true
        },
        proposal: true,
        invoices: {
          payment: true
        }
      });

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;