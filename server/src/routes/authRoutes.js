import express from 'express';
import { login, getSession } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/session', getSession);

export default router;
