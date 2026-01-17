import modelIndex from "../models/modelIndex.js";
import { logActivity } from "../utils/logActivity.js";
const {User, Inventory} = modelIndex;

class InventoryController {
    async createInventory(req, res) {
        if (!req.user || !req.product || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const userId = req.user._id || req.user.id;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }
            const {quantity, reserved} = req.body;
            const product = req.product;
            const existing = await Inventory.findOne({productId: product._id});
            if (existing) {
                return res.status(409).send({ message: "Product with this SKU already exists in the store" });
            }
            const inventory = await Inventory.create({productId: product._id, quantity, reserved});
            await logActivity({userId: req.user._id, type: "INVENTORY_CREATED", payload: {inventory}});
            return res.status(201).send({ message: "Inventory successfully created!", inventory });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        } 
    }
    async getInventories(req, res) {
        try {
            const inventories = await Inventory.find();
            if (!inventories) {
                return res.status(404).send({ message: "Inventories not found" });
            }
            return res.status(200).send({inventories});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }
    async getInventoryById(req, res) {
        if (!req.user || !req.params) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const userId = req.user._id;
            const {id} = req.params;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }
            const inventory = await Inventory.findOne({_id: id});
            if (!inventory) {
                return res.status(404).send({ message: "Inventory not found" });
            }
            return res.status(200).send({inventory});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }
    async updateInventory(req, res) {
        if (!req.user || !req.params || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const userId = req.user._id;
            const {id} = req.params;
            const {quantity, reserved} = req.body;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }
            const inventory = await Inventory.findOne({_id: id});
            if (!inventory) {
                return res.status(404).send({ message: "Inventory not found" });
            }
            inventory.quantity = quantity ? quantity : inventory.quantity;
            inventory.reserved = reserved ? reserved : inventory.reserved;
            await inventory.save();
            await logActivity({userId: req.user._id, type: "INVENTORY_UPDATED", payload: {inventory}});
            return res.status(200).send({ message: "Inventory successfully updated!", inventory });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }
    async deleteInventory(req, res) {
        if (!req.user || !req.params) {
            return res.status(401).send({ message: "Missing fields..." });
        }
        try {
            const userId = req.user._id;
            const {id} = req.params;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }
            const deleted = await Inventory.findOneAndDelete({_id: id});
            if (!deleted) {
                return res.status(404).send({ message: "Inventory not found" });
            }            
            await logActivity({userId: req.user._id, type: "INVENTORY_DELETED", payload: {deleted}});
            return res.status(200).send({ message: "Inventory successfully deleted!", deleted });
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }
}

export default new InventoryController();