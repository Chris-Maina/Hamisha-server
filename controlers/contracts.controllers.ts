import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import {
  Contract,
  Invoice,
  Job,
  Proposal,
  User
} from "../models";
import { contractSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { CONTRACT_STATUS, USER_TYPES } from "../common/constants";
import { JOB_STATUS, RequestWithPayload } from "../common/interfaces";

const router = Router();
const contractFields: string[] = [
  'id', 'start_time', 'title', 'status', 'proposal_id', 'mover_id'
];

const updateJobFromContract = async (contract: any): Promise<number | void | unknown []> => {
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

    if (!user) throw new createHttpError.NotFound("User is not registered. Register as new user");

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
        customer: {
          account: true
        },
        proposal: true,
      });

    updateJobFromContract(response);
    // Create invoices for both mover and customer
    const [existingInvoice, adminUser] = await Promise.all([
      await Invoice.query().findOne({ contract_id: response.id }),
      await User.query().findOne({ role: USER_TYPES.ADMIN })
    ]);
  
    if (!existingInvoice && adminUser) {
      // const total: number = response.proposal.payment_amount - (COMMISSION * response.proposal.payment_amount);
      await Invoice.query().insert([
        {
          issued_by: adminUser.id,
          issued_to: response.customer.account.id,
          contract_id: response.id,
          total: response.proposal.payment_amount,
          description: `User with id ${response.customer.account.id} pay ksh ${response.proposal.payment_amount}`,
          due_date: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)),// 3 days after current date
        },
        {
          issued_by: response.mover.account.id,
          issued_to: adminUser.id,
          contract_id: response.id,
          total: response.proposal.payment_amount,
          description: `Admin pay user with id ${response.mover.account.id} ksh ${response.proposal.payment_amount}`,
          due_date: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)),// 3 days after current date
        }
      ]);
    }
  
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

    const contract = await Contract.query().findById(id);
    if (!contract) throw new createHttpError.NotFound("Contract does not exist. Create one");

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

    updateJobFromContract(response);
    
    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const contract = await Contract.query().findById(id);
    if (!contract) throw new createHttpError.NotFound("Contract does not exist. Create one");

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

    updateJobFromContract(response);

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
          payment: true,
          recipient: true,
          creator: true
        }
      });

    if (!response) throw new createHttpError.NotFound("Contract does not exist. Create one");

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

export default router;