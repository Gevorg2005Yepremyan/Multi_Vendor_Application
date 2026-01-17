import express from 'express';
import VendorController from '../controllers/VendorController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import isValidated from '../middlewares/isValidated.js';
import validateVendorData from '../middlewares/validateVendorData.js';

const vendorRouter = express.Router();

vendorRouter.use(isAuthenticated);
vendorRouter.get('/all', isValidated("admin"), VendorController.getVendors);
vendorRouter.post('/create', VendorController.createVendor);
vendorRouter.get('/someone', validateVendorData, VendorController.getVendorById);
vendorRouter.put('/edit/:id', isValidated('vendor'), VendorController.updateVendor);
vendorRouter.delete('/delete', isValidated("admin"), VendorController.deleteVendor);

export default vendorRouter;