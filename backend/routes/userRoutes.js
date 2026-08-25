import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const userRouter = express.Router();

userRouter.post('/register', authLimiter, registerUser);
userRouter.post('/login', authLimiter, loginUser);
userRouter.post('/admin', authLimiter, adminLogin);

export default userRouter;
