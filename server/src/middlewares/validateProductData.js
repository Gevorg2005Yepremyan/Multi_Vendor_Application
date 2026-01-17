import modelIndex from "../models/modelIndex.js";
const {Store} = modelIndex;
export default async function validateProductData(req, res, next) {
    const {sku, title} = req.body;
    if (!sku || sku.length < 9 || !title || title.length < 2) {
        return res.status(400).send({message: "Invalid product"});
    }
    next()
}