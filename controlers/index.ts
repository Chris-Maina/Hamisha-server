import { Router } from 'express';
import jobRoutes from './jobs.controlers';
import authRoutes from './auth.controlers';
import userRoutes from './users.controlers';

const router = Router();
router.use(authRoutes);
router.use(userRoutes);
router.use('/jobs', jobRoutes);

export default router;
