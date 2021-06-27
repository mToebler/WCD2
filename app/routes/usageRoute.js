//app/routes/usageRoute.js

import express from 'express';

import { createUsage, getUsage, getUsageAmount } from '../controllers/usageController.js';
import verifyAuth from '../middlewares/verifyAuth.js';
   
const router = express.Router();

// Event Routes
// POST creates. Not idempotent
router.post('/usage', verifyAuth, createUsage);
// GET retrieves. Idempotent
router.get('/usage', verifyAuth, getUsage);
router.get('/used', verifyAuth, getUsageAmount);
// PUT updates the entire resource. Idempotent
// PATCH could update just certain events, but not currently part of API
// DELETE would remove records, but this is not part of the API
export default router;