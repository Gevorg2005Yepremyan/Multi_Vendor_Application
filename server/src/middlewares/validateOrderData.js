import modelIndex from "../models/modelIndex.js";
const {User, Store, Product} = modelIndex;

export default async function validateOrderData(req, res, next) {
    try {
        const {userId} = req.user._id;
        const {storeId, productId} = req.body;
        const user = await User.findById(userId);
        if (!user || !user.tokenVersion) {
            return res.status(404).send({message: "User not found!"});
        }
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).send({message: "Store not found!"});
        }
        req.store = store;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({message: "Product not found!"});
        }
        req.product = product;
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Internal server error!" });
    }
}