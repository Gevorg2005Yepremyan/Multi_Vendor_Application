import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import InventoryController from '../controllers/InventoryController.js';
import validateInventoryData from '../middlewares/validateInventoryData.js';
import allowRoles from '../middlewares/isValidated.js';

const inventoryRouter = express.Router();


inventoryRouter.use(isAuthenticated);
inventoryRouter.get("/all", allowRoles("admin"), InventoryController.getInventories);
inventoryRouter.post("/create", allowRoles("vendor"), validateInventoryData, InventoryController.createInventory);
inventoryRouter.get("/get/:id", allowRoles("vendor"), InventoryController.getInventoryById);
inventoryRouter.put("/update/:id", allowRoles("vendor"), InventoryController.updateInventory);
inventoryRouter.delete("/delete/:id", allowRoles("vendor", "admin"), InventoryController.deleteInventory);

export default inventoryRouter;