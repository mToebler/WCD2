//app/routes/adminRoute.js

import express from 'express';

import { createAdmin, updateUserToAdmin } from '../controllers/adminController.js';
import verifyAuth from '../middlewares/verifyAuth.js';

const router = express.Router();

// Event Routes
// POST creates. Not idempotent
router.post('/admin', verifyAuth, createAdmin);
// GET retrieves. Idempotent
// router.get('/admin', verifyAuth, authAdmin);
// PUT updates the entire resource. Idempotent
// router.put('/user', verifyAuth, updateEventDetails);
// PATCH could update just certain events, but not currently part of API
router.patch('/admin', verifyAuth, updateUserToAdmin);
// DELETE would remove records, but this is not part of the API
export default router;