import express from "express";
import AccountController from "../controllers/AccountController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import allowRoles from "../middlewares/isValidated.js";
const accountRouter = express.Router();

accountRouter.use(isAuthenticated);
accountRouter.get("/search/:text", allowRoles("admin", "vendor", "customer", "user"), AccountController.searchUsers);
accountRouter.get("/login-or-logout/:tokenVersion", allowRoles("admin", "vendor", "customer", "user"), AccountController.searchLoginedOrLogoutedUsers);
accountRouter.get("/filter/:age", allowRoles("admin", "vendor", "customer", "user"), AccountController.filterUsers);
accountRouter.get("/profile/:phone/:avatarUrl", allowRoles("admin", "vendor", "customer", "user"), AccountController.searchProfile);

export default accountRouter;
