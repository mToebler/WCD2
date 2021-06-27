
//app/routes/usersRoute.js

import express from 'express';

import { createUser, authUser } from '../controllers/usersController.js';
import verifyAuth from '../middlewares/verifyAuth.js';

const router = express.Router();

// Event Routes
// POST creates. Not idempotent
router.post('/user', createUser);
// GET retrieves. Idempotent
router.get('/user', verifyAuth, authUser);
// PUT updates the entire resource. Idempotent
// router.put('/user', verifyAuth, updateEventDetails);
// PATCH could update just certain events, but not currently part of API
// DELETE would remove records, but this is not part of the API
export default router;