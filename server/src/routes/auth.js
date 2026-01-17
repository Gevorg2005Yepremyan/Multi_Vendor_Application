import express from 'express';
import UserController from '../controllers/UserContoller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const authRouter = express.Router();

authRouter.post('/signup', UserController.signup);
authRouter.post('/login', UserController.login);

authRouter.use(isAuthenticated);
authRouter.get('/user', UserController.user);
authRouter.get('/forgot-password', UserController.forgotPassword);
authRouter.post('/reset-password', UserController.changePassword);
authRouter.get('/logout', UserController.logout);

export default authRouter;