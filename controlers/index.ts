import { Router } from 'express';
import jobRoutes from './jobs.controlers';
import authRoutes from './auth.controlers';
import userRoutes from './users.controlers';
import roomRoutes from './rooms.controlers';
import paymentRoutes from './payments.controllers';
import proposalRoutes from './proposal.controllers';
import contractRoutes from './contracts.controllers';
import invoiceRoutes from './invoice.controllers';
import paymentTypeRoutes from './payment_types.controllers';
import vehicleRoutes from "./vehicles.controller";

const router = Router();
router.use(authRoutes);
router.use(userRoutes);
router.use('/jobs', jobRoutes);
router.use('/rooms', roomRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/proposals', proposalRoutes);
router.use('/contracts', contractRoutes);
router.use('/payment_types', paymentTypeRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
