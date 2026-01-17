import modelIndex from "../models/modelIndex.js";
const {Product} = modelIndex;

export default async function validateInventoryData(req, res, next) {
    try {
        const { productId } = req.body;
        const product = await Product.findOne({_id: productId});
        console.log("validateInventoryData product:", product);
        if (!product) {
            return res.status(403).send({ message: "Product profile not found for this store" });
        }

        req.product = product;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Internal server error!" });
    }
}