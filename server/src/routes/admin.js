import express from 'express';
import AdminController from '../controllers/AdminController.js';
import validateAdminActions from '../middlewares/validateAdminActions.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
const adminRouter = express.Router();

adminRouter.use(isAuthenticated);
adminRouter.get("/all", validateAdminActions, AdminController.getUsers);
adminRouter.get("/get/:id", validateAdminActions, AdminController.getUserById);
adminRouter.put("/update/:id", validateAdminActions, AdminController.updateUser);
adminRouter.delete("/delete/:id", validateAdminActions, AdminController.deleteUser);

export default adminRouter;