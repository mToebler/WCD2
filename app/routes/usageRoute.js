//app/routes/usageRoute.js

import express from 'express';

import { createUsage, getUsage, getUsageAmount, testFlume, getRange, processFlume } from '../controllers/usageController.js';
import verifyAuth from '../middlewares/verifyAuth.js';
   
const router = express.Router();

// Event Routes
// POST creates. Not idempotent
router.post('/usage', verifyAuth, createUsage);
// GET retrieves. Idempotent
router.get('/usage', verifyAuth, getUsage);
router.get('/used', verifyAuth, getUsageAmount);
// 17 minutes 6-10-21 from 9:17pm
// /usage/start/1623359866000/stop/1623360886000
router.get('/usage/init', testFlume);
router.get('/usage/range', getRange);

// PUT updates the entire resource. Idempotent
router.put('/usage/process', processFlume);
// PATCH could update just certain events, but not currently part of API
// DELETE would remove records, but this is not part of the API
export default router;