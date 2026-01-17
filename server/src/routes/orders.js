import express from "express";
import validateOrderData from "../middlewares/validateOrderData.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import allowRoles from "../middlewares/isValidated.js";
import OrderController from "../controllers/OrderController.js";
import validateReviewData from "../middlewares/validateReviewData.js";

const orderRouter = express.Router();

orderRouter.use(isAuthenticated);
orderRouter.get("/all", allowRoles("admin"), OrderController.getOrders);
orderRouter.get("/review/all", allowRoles("admin"), OrderController.getReviews);
orderRouter.post("/create", allowRoles("customer"), validateOrderData, OrderController.createOrder);
orderRouter.get("/my", allowRoles("customer"), OrderController.getMyOrders);
orderRouter.get("/get/:id", allowRoles("customer"), OrderController.getOrderById);
orderRouter.get("/store", allowRoles("vendor"), OrderController.getStoreOrders);
orderRouter.put("/update/:id", allowRoles("vendor", "admin"), OrderController.updateOrderStatus);
orderRouter.delete("/delete/:id", allowRoles("vendor", "admin"), OrderController.deleteOrder);
orderRouter.post("/review/create", allowRoles("customer"), validateReviewData, OrderController.createOrder);
orderRouter.get("/review/my", allowRoles("customer"), OrderController.getMyReviews);
orderRouter.get("/review/get/:id", allowRoles("customer"), OrderController.getReviewById);
orderRouter.delete("/review/delete/:id", allowRoles("vendor", "admin"), OrderController.deleteReview);

export default orderRouter;