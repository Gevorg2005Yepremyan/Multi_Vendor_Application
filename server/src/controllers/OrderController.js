import modelIndex from "../models/modelIndex.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import { logActivity } from "../utils/logActivity.js";
const { User, Vendor, Order, OrderItem, Review } = modelIndex;

class OrderController {
    async createOrder(req, res) {
        if (!req.user || !req.store || !req.product || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const { items, currency, status, method, providerData, paymentStatus } =
                req.body;
            const userId = req.user._id;
            let storeId = null;
            const populateItems = [];
            let total = 0;
            for (const item of items) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(401).send({ message: "Missing fields..." });
                }

                if (!storeId) {
                    storeId = product.storeId;
                }

                if (String(product.storeId) !== String(storeId)) {
                    return res
                        .status(400)
                        .send({ message: "All items must be from the same store" });
                }

                const quantity = item.quantity || 1;
                const linePrice = product.price * quantity;
                total += linePrice;
                const orderItem = await OrderItem.create({
                    productId: product._id,
                    title: product.title,
                    untilPrice: product.price,
                    quantity,
                });
                populateItems.push(orderItem);
            }
            storeId = req.store._id;
            const order = await Order.create({
                userId,
                storeId,
                items: populateItems,
                totalAmount: total,
                currency,
                status,
            });
            const payment = await Payment.create({
                orderId: order._id,
                amount: total,
                method,
                providerData,
                paymentStatus,
            });
            await logActivity({
                userId,
                type: "ORDER_CREATED",
                payload: { order, payment },
            });
            return res
                .status(201)
                .send({ message: "Order created successfully", order, payment });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await Order.find();
            if (!orders) {
                return res.status(403).send({ message: "Orders not found!" });
            }
            return res.status(200).send({ orders });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getOrderById(req, res) {
        if (!req.user) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const order = await Order.findOne({ _id: id, userId });
            if (!order) {
                return res.status(404).send({ message: "Order not found!" });
            }
            return res.status(200).send({ order });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getMyOrders(req, res) {
        if (!req.user) {
            return res.status(401).send({ message: "Not authenticated" });
        }

        try {
            const userId = req.user._id || req.user.id;

            const orders = await Order.find({ userId });

            return res.status(200).send({ orders });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getStoreOrders(req, res) {
        if (!req.user) {
            return res.status(401).send({ message: "Not authenticated" });
        }
        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;
            const vendor = await Vendor.findOne({ userId });
            if (!vendor) {
                return res.status(403).send({ message: "Vendor not found" });
            }

            const store = await Store.findOne({ vendorId: vendor._id });
            if (!store) {
                return res.status(404).send({ message: "Store not found" });
            }

            const orders = await Order.find({ storeId: id });

            return res.status(200).send({ orders });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async updateOrderStatus(req, res) {
        if (!req.user || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }

        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;
            const { status } = req.body;

            if (!["pending", "paid", "shipped", "cancelled"].includes(status)) {
                return res.status(400).send({ message: "Invalid status value" });
            }

            const vendor = await Vendor.findOne({ userId });
            if (!vendor) {
                return res.status(403).send({ message: "Vendor not found" });
            }

            const order = await Order.findOne({ _id: id });
            if (!order) {
                return res.status(404).send({ message: "Order not found" });
            }

            order.status = status;
            await order.save();

            await logActivity({
                userId,
                type: "ORDER_STATUS_UPDATED",
                payload: { orderId: order._id, status },
            });

            return res.status(200).send({ message: "Order status updated", order });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async deleteOrder(req, res) {
        if (!req.user) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const { id } = req.params;
            const deleted = await Order.findOneAndDelete({ _id: id });
            if (!deleted) {
                return res.status(400).send({ message: "Order already deleted!" });
            }
            return res
                .status(200)
                .send({ message: "Order successfully deleted", deleted });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async addReview(req, res) {
        if (!req.user || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const { id } = req.user;
            const { productId, rating, title, description } = req.body;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send({ message: "Product not found!" });
            }
            const review = await Review.create({
                productId,
                userId: id,
                rating,
                title,
                description,
            });
            await logActivity({
                userId: id,
                type: "REVIEW_CREATED",
                payload: { review }
            });
            return res
                .status(201)
                .send({ message: "Review created successfully", review });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getReviews(req, res) { 
        try {
            const reviews = await Review.find();
            if (!reviews) {
                return res.status(404).send({ message: "Reviews not found!" });
            }
            return res
                .status(200)
                .send({ reviews });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getReviewById(req, res) { 
        if (!req.user) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const {id} = req.params;
            const review = await Review.findOne({_id: id});
            if (!review) {
                return res.status(404).send({ message: "Review not found!" });
            }
            return res
                .status(200)
                .send({ review });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async getMyReviews(req, res) { 
        if (!req.user) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const {id} = req.user;
            const review = await Review.findOne({userId: id});
            if (!review) {
                return res.status(404).send({ message: "Review not found!" });
            }
            return res
                .status(200)
                .send({ review });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async deleteReview(req, res) { 
        if (!req.user) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const {id} = req.params;
            const deleted = await Review.findOneAndDelete({_id: id});
            if (!deleted) {
                return res.status(404).send({ message: "Review not found!" });
            }
            return res
                .status(200)
                .send({ deleted });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }
}

export default new OrderController();
