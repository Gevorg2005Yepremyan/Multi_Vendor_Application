import mongoose from "mongoose";
import ActiveIndex from "../models/modelIndex.js";
import { logActivity } from "../utils/logActivity.js";
const {User, Store, Vendor} = ActiveIndex;

class StoreController {
    async createStore(req, res) {
        if (!req.user || !req.body) {
            return res.status(401).send({message: "Missing fields..."});
        }
        try {
            const {id} = req.user;
            const user = await User.findById(id);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            const {name, slug, description} = req.body;
            const vendor = await Vendor.findOne({userId: id});
            if (!vendor) {
                return res.status(404).send({message: "Vendor not found"});
            }

            const existing = await Store.findOne({where: {vendorId: vendor._id}});
            if (existing) {
                return res.status(401).send({message: 'Store already exists!'});
            }
            const store = await Store.create({vendorId: vendor._id, name, slug, description});
            await logActivity({userId: id, type: "STORE_CREATED", payload: {vendor}});
            return res.status(201).send({message: "store created successfully", store});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }

    async getStores(req, res) {
        try {
            const stores = await Store.find();
            if (!stores) {
                return res.status(404).send({message: "Stores not found"});
            }
            return res.status(200).send({stores});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }

    async getStoreById(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "User's not authorized!"});
        }
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            const vendor = await Vendor.findOne({userId});
            if (!vendor) {
                return res.status(404).send({message: "Vendor not found"});
            }
            const vendorId = vendor._id
            const store = await Store.findOne({vendorId});
            if (!store) {
                return res.status(404).send({message: "Store not found"});
            }
            return res.status(200).send({store});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }

    async updateStore(req, res) {
        if (!req.user || !req.body) {
            return res.status(401).send({message: "Missing fields..."});
        }
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            co
            const {requestedVendorId, name, slug, description} = req.body;
            const vendor = await Vendor.findOne({userId});
            if (!vendor) {
                return res.status(404).send({message: "Vendor not found"});
            }
            const vendorId = vendor._id;
            const store = await Store.findOne({vendorId});
            if (!store) {
                return res.status(404).send({message: "Store not found"});
            }
            if (requestedVendorId !== undefined) {
                if (!mongoose.Types.ObjectId.isValid(requestedVendorId)) {
                    return res.status(400).json({ message: 'Invalid vendorId provided' });
                }
                const newVendor = await Vendor.findOne({requestedVendorId});
                if (!newVendor) {
                    return res.status(400).json({ message: 'Target userId does not exist' });
                }
                store.vendorId = newVendor._id;
            }
            store.name = !name ? store.name : name;
            store.slug = !slug ? store.slug : slug;
            store.description = !description ? store.description : description;
            await store.save();
            await logActivity({userId, type: "STORE_UPDATED", payload: {vendor}});
            return res.status(201).send({message: "store updated successfully", store});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }

    async deleteStore(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "User's not authorized!"});
        }
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            co
            const vendor = await Vendor.findOne({userId});
            if (!vendor) {
                return res.status(404).send({message: "Vendor not found"});
            }
            const vendorId = vendor._id
            const deleted = await Store.deleteOne({vendorId});
            if (!deleted) {
                return res.status(404).send({message: "Store already deleted too long!"});
            }
            await logActivity({userId, type: "STORE_DELETED", payload: {vendor}});
            return res.status(200).send({message: "store deleted successfully", deleted});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
}

export default new StoreController();