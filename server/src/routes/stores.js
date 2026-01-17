import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import validateStoreData from '../middlewares/validateStoreData.js';
import StoreController from '../controllers/StoreController.js';
import allowRoles from '../middlewares/isValidated.js';

const storeRouter = express.Router();

storeRouter.use(isAuthenticated);
storeRouter.get("/all", allowRoles("admin"), StoreController.getStores);
storeRouter.post("/create", allowRoles('vendor'), validateStoreData, StoreController.createStore);
storeRouter.get("/get", allowRoles('vendor'), StoreController.getStoreById);
storeRouter.put("/update", allowRoles('vendor'), StoreController.updateStore);
storeRouter.delete("/delete", allowRoles('vendor'), StoreController.deleteStore);

export default storeRouter;