//app/routes/eventRoute.js

import express from 'express';

import { getEventRange, retrieveAPIEvents, addEventDetails, updateEventDetails, summarizeRachio } from '../controllers/eventController.js';
import verifyAuth from '../middlewares/verifyAuth.js';
   
const router = express.Router();

// Event Routes
// POST creates. Not idempotent
router.post('/events', verifyAuth, addEventDetails);
// GET retrieves. Idempotent
// router.get('/events', verifyAuth, retrieveEvents);
router.get('/events', retrieveAPIEvents);
router.get('/test', summarizeRachio);
// PUT updates the entire resource. Idempotent
router.put('/events', verifyAuth, updateEventDetails);
// PATCH could update just certain events, but not currently part of API
// DELETE would remove records, but this is not part of the API
export default router;