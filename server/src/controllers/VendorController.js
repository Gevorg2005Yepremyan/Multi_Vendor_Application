import ActiveIndex from "../models/modelIndex.js";
import { logActivity } from "../utils/logActivity.js";

const {User, Vendor} = ActiveIndex;

class VendorController {
    async createVendor(req, res) {
        if (!req.body || !req.user) {
            return res.status(400).send({ message: 'Missing fields...' });
        }
        try {
            const {id} = req.user;
            const {companyName, description, verified} = req.body;
            const user = await User.findById(id);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User doesn't exist" });
            }
            const existing = await Vendor.findOne({where: {userId: id}});
            if (existing) {
                return res.status(409).send({ message: 'Vendor profile already exists for this user' });
            }
            const vendor = new Vendor({userId: id, companyName, description, verified});
            await vendor.save();
            await logActivity({userId: id, type: 'VENDOR_CREATED', payload: {vendorId: vendor._id, companyName, description, verified}});
            return res.status(201).send({ message: 'Vendor profile created successfully', vendor });
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({ message: 'Internal server error!' });
        }
    }

    async getVendors(req, res) {
        try {
            const vendors = await Vendor.find();
            if (!vendors) {
                return res.status(404).send({ message: 'No vendors found' });
            }
            return res.status(200).send({ vendors });
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({ message: 'Internal server error!' });
        }
    }

    async getVendorById(req, res) {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            const vendor = await Vendor.findOne({ userId }).populate('userId');
            if (!vendor) {
                return res.status(404).json({ message: "Vendor doesn't exist" });
            }
            await logActivity({ userId: req.user._id, type: 'VENDOR_FOUND', payload: { vendorId: vendor._id } });
            return res.status(200).json({ vendor_found: true, vendor });
        } catch (err) {
        console.error('getMyVendor error', err);
        return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async updateVendor(req, res) {
        if (!req.body) {
            return res.status(400).send({ message: 'Missing fields...' });
        }

        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).send({ message: 'Unauthorized: user not found' });
            }
            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            const { companyName, description, verified } = req.body;
            const vendor = await Vendor.findOne({ userId });
            if (!vendor) {
                return res.status(404).send({ message: "Vendor doesn't exist" });
            }

            if (companyName !== undefined) vendor.companyName = companyName;
            if (description !== undefined) vendor.description = description;
            if (verified !== undefined) vendor.verified = verified;

            await vendor.save();
            await logActivity({ userId, type: 'VENDOR_UPDATED', payload: { vendor } });
            return res.status(200).send({ message: 'Vendor updated successfully', vendor });
        } catch (err) {
            console.error('updateVendor error', err);
            return res.status(500).send({ message: 'Internal server error!' });
        }
    }


    async deleteVendor(req, res) {
        if (!req.user) {
            return res.status(400).send({ message: 'Missing fields...' });
        }
        try {
            const {id} = req.user;
            const user = await User.findById(id);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({message: 'User not found or not logined!'});
            }
            const isAdmin = req.user.role === 'admin';
            if (isAdmin) {
                const deleted = await Vendor.findOneAndDelete({where: {userId: id}});
                if (!deleted) {
                    return res.status(404).send({message: 'Vendor doesn\'t exist'});
                }
                await logActivity({userId: id, type: 'VENDOR_DELETED', payload: {vendorId: deleted._id, deleted}});
                return res.status(200).send({message: 'Vendor deleted successfully'}, deleted);
            }
            else {
                await logActivity({userId: id, type: 'VENDOR_DELETE_FAILED', payload: {Id: id}});
                return res.status(400).send({message: 'Vendor not deleted because of not admin user'});
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Internal server error!'});
        }
    }
}

export default new VendorController();