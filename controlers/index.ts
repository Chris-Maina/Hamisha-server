import { Router } from 'express';
import jobRoutes from './jobs.controlers';
import authRoutes from './auth.controlers';
import userRoutes from './users.controlers';
import paymentTypeRoutes from './payment_types.controllers';

const router = Router();
router.use(authRoutes);
router.use(userRoutes);
router.use('/jobs', jobRoutes);
router.use('/payment_types', paymentTypeRoutes)

export default router;
