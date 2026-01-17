import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import validateProductData from '../middlewares/validateProductData.js';
import ProductController from '../controllers/ProductController.js';
import allowRoles from '../middlewares/isValidated.js';
import { upload } from '../services/upload.js';

const productRouter = express.Router();

productRouter.use(isAuthenticated);
productRouter.get("/all", allowRoles("admin"), ProductController.getProducts);
productRouter.post("/create", upload.array("images", 8), allowRoles("vendor", "admin"), validateProductData, ProductController.createProduct);
productRouter.get("/get/:id", allowRoles("vendor", "admin"), ProductController.getProductById);
productRouter.put("/update/:id", upload.array("images", 8), allowRoles("vendor", "admin"), ProductController.updateProduct);
productRouter.delete("/delete/:id", allowRoles("vendor", "admin"), ProductController.deleteProduct);

export default productRouter;