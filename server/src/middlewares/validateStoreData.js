import mongoose from "mongoose";

export default async function validateStoreData(req, res, next) {
    const {vendorId, name, slug} = req.body;
    if (mongoose.Types.ObjectId(vendorId) !== String || !name || name.length < 2 || !slug || slug.length < 2) {
        return res.status(400).send({message: "Invalid store"});
    }
    next();
}