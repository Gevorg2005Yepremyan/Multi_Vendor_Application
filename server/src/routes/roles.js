import express from 'express';
import RoleController from '../controllers/RoleController.js';
const roleRouter = express.Router();

roleRouter.post("/add", RoleController.addRole);
roleRouter.get("/get/:id", RoleController.showRole);
roleRouter.get("/getAll", RoleController.showRoles);
roleRouter.delete("/delete/:id", RoleController.deleteRole);

export default roleRouter;