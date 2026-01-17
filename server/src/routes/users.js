import express from 'express';
import UserController from '../controllers/UserContoller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { upload } from '../services/upload.js';

const userRouter = express.Router();
userRouter.use(isAuthenticated);

userRouter.post('/profile', upload.single("avatarUrl"), UserController.uploadProfile);
userRouter.put('/profile', upload.single("avatarUrl"), UserController.changeProfile);
userRouter.put('/edit', UserController.changeUser);
userRouter.get('/activity', UserController.switchActivity);

export default userRouter;