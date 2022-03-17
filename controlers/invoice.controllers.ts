import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Invoice, User } from "../models";
import { invoiceSchema } from "../schemas";
import { verifyToken } from "../helpers/jwt_helpers";
import { RequestWithPayload } from "../common/interfaces";
import { USER_TYPES } from "../common/constants";
import { b2cMpesaRequest, lipaNaMpesaRequest } from "../helpers/payment_helpers";

const router = Router();

router.get('/', verifyToken, async (req: RequestWithPayload, res: Response, next: NextFunction) => {
  try {
    const { id } = req.payload;
    let response;
    const user = await User
      .query()
      .findById(id)
      .withGraphFetched({
        mover: true,
        customer: true,
      });

    if (!user) new createHttpError.NotFound("User is not registered");

    if (user.customer) {
      // Get bills issued to customer
      response = await Invoice
        .query()
        .where("issued_to", id)
        .withGraphFetched({
          contract: {
            proposal: true
          },
          payment: true
        });
    } else {
      // Get invoices issued by mover
      response = await Invoice
        .query()
        .where("issued_by", id)
        .withGraphFetched({
          contract: {
            proposal: true
          },
          creator: true,
          recipient: true,
        });
    }


    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceSchema.validateAsync(req.body);
    const adminUser = await User.query().findOne({ role: USER_TYPES.ADMIN });
    let invoice;
    if (result.issued_to) {
      // Check for an invoice for the parties involved
      const existingInvoice = await Invoice.query().findOne({
        issued_to: result.issued_to,
        issued_by: adminUser.id,
        contract_id: result.contract_id
      });

      if (existingInvoice) throw new createHttpError.Conflict("An invoice exists for your payment. Don't send payment");

      // Sending an invoice from hamisha/admin to customer
      invoice = await Invoice
        .query()
        .insert({ 
          ...result,
          issued_by: adminUser.id,
          description: `User with id ${result.issued_to} pay ksh ${result.total}`
        })
        .returning(['id', 'contract_id', 'issued_by'])
        .withGraphFetched({
          recipient: true,
        });
      await lipaNaMpesaRequest(
        invoice.total, 
        invoice.id,
        invoice.contract_id,
        invoice.recipient!.phone_number
      );
    }
    if (result.issued_by) {

      // Check for an invoice for the parties involved
      const existingInvoice = await Invoice.query().findOne({
        issued_by: result.issued_by,
        issued_to: adminUser.id,
        contract_id: result.contract_id
      });

      if (existingInvoice) throw new createHttpError.Conflict("An invoice exists for your payment. Don't send payment");

      // Sending an invoice from mover to hamisha/admin
      // const amountToSend: number = result.total - (COMMISSION * result.total);
      // const amountToSend: number = 1;
      invoice = await Invoice
        .query()
        .insert({ 
          ...result,
          // total: amountToSend
          issued_to: adminUser.id,
          description: `Admin pay user with id ${result.issued_by} ksh ${result.total}`
        })
        .returning(['id', 'contract_id', 'issued_by'])
        .withGraphFetched({
          creator: true,
        });

        await b2cMpesaRequest(
          invoice.total,
          invoice.id,
          invoice.contract_id,
          invoice.creator!.phone_number
        );
    }

    res.status(201);
    res.send(invoice);
  } catch (error: any) {
    if (error.isJoi) return next(new createHttpError.BadRequest(error.details[0].message));
    next(error);
  }
});

export default router;
