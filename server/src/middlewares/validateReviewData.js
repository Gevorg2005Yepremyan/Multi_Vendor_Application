import modelIndex from "../models/modelIndex.js";
const {User, Product} = modelIndex;

export default async function validateReviewData(req, res, next) {
    const {productId, rating, title} = req.body;
    const {id} = req.user;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).send({message: "User not found"});
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).send({message: "Product not found"});
    }
    if (rating < 0 || rating > 5) {
        return res.status(402).send({message: "Out of ratings"});
    }
    if (!title) {
        return res.status(401).send({message: "Title is missing!"});
    }
    next();
}