import ActiveIndex from '../models/modelIndex.js';
import Role from '../models/Role.js';
const { User, Vendor } = ActiveIndex;

export default function allowRoles(...allowed) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            if (allowed.includes("admin")) {
                const role = await Role.findOne({name: "admin"});
                const user = await User.findOne({_id: req.user._id, role: role._id});
                if (user) {
                    return next();
                }
                
            }

            if (allowed.includes("customer")) {
                const role = await Role.findOne({name: "customer"});
                const {id} = req.user;
                const user = await User.findOne({id, role: role._id});
                if (user || user.tokenVersion) {
                    return next();
                }
            }

            if (allowed.includes("vendor")) {
                const vendor = await Vendor.findOne({ userId: req.user._id });
                if (vendor) {
                    req.vendor = vendor;
                    return next();
                }
            }

            return res.status(403).json({ message: "User not authorized" });
        } catch (err) {
            console.error("allowRoles error", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}