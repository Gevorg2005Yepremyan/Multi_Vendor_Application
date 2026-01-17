import ActiveIndex from "../models/modelIndex.js";
import { logActivity } from "../utils/logActivity.js";
const {User, Vendor, Store, Product, File} = ActiveIndex;

class ProductController {
    async createProduct(req, res) {
        if (!req.user || !req.body) {
            return res.status(401).send({ message: "Missing fields..." });
        }

        try {
            const userId = req.user._id || req.user.id;
            const { sku, title, description, price, currency, isActive } = req.body;

            const bodyStoreId = req.body.storeId;

            if (!sku || !title || !price) {
                return res.status(400).send({ message: "sku, title and price are required" });
            }

            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }

            const vendor = await Vendor.findOne({ userId });
            if (!vendor) {
                return res.status(403).send({ message: "Vendor profile not found for this user" });
            }

            let store;
            if (bodyStoreId) {
                store = await Store.findById(bodyStoreId);
                if (!store) {
                    return res.status(404).send({ message: "Store not found" });
                }

                if (String(store.vendorId) !== String(vendor._id)) {
                    return res.status(403).send({ message: "Store does not belong to this vendor" });
                }
            } else {
                store = await Store.findOne({ vendorId: vendor._id });
                if (!store) {
                    return res.status(404).send({ message: "Store not found for vendor" });
                }
            }

            const existing = await Product.findOne({
                $or: [
                    { StoreId: store._id },
                    { storeId: store._id }
                ],
                sku
            });

            if (existing) {
                return res.status(409).send({ message: "Product with this SKU already exists in the store" });
            }

            const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
            const fileRecords = [];

            for (const f of files) {
                const publicUrl = `/uploads/${f.filename}`;
                const created = await File.create({
                    ownerType: "product",
                    ownerId: null,
                    url: publicUrl,
                    mime: f.mimetype,
                    size: f.size
                });
                fileRecords.push(created);
            }

            const product = await Product.create({
                storeId: store._id,
                sku,
                title,
                description,
                price,
                currency,
                images: fileRecords.map(fr => fr.url),
                isActive
            });

            if (fileRecords.length) {
                await Promise.all(
                    fileRecords.map(fr =>
                        File.findByIdAndUpdate(fr._id, { ownerId: product._id })
                    )
                );
            }

            await logActivity({
                userId,
                type: "PRODUCT_CREATED",
                payload: { productId: product._id, storeId: store._id, sku }
            });

            return res.status(201).send({ message: "Product successfully created!", product });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }


    async getProducts(req, res) {
        try {
            const products = await Product.find();
            if (!products) {
                return res.status(404).send({message: "Stores not found"});
            }
            return res.status(200).send({products});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
    
    async getProductById(req, res) {
        if (!req.user || !req.body.productId) {
            return res.status(400).send({ message: "productId is required" });
        }
        try {
            const userId = req.user._id || req.user.id;
            const { productId } = req.params;

            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: 'User not found or not logged in!' });
            }

            const vendor = await Vendor.findOne({ userId });
            if (!vendor) return res.status(404).send({ message: "Vendor not found" });

            const store = await Store.findOne({ vendorId: vendor._id });
            if (!store) return res.status(404).send({ message: "Store not found" });

            const product = await Product.findOne({ _id: productId, storeId: store._id });
            if (!product) return res.status(404).send({ message: "Product not found" });

            return res.status(200).send({ product });
        } catch (err) {
            console.log(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

    async updateProduct(req, res) {
        if (!req.user || !req.params) {
            return res.status(400).send({ message: "productId is required" });
        }

        try {
            const {id} = req.params
            const userId = req.user._id || req.user.id;
            const { sku, title, description, price, currency, isActive } = req.body;

            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }

            const vendor = await Vendor.findOne({ userId });
            if (!vendor) return res.status(403).send({ message: "Vendor not found" });

            const store = await Store.findOne({ vendorId: vendor._id });
            if (!store) return res.status(404).send({ message: "Store not found" });

            const product = await Product.findOne({ _id: id, storeId: store._id });
            if (!product) return res.status(404).send({ message: "Product not found" });

            if (sku && sku !== product.sku) {
                const exists = await Product.findOne({
                    storeId: store._id,
                    sku,
                    _id: { $ne: product._id }
                });
                if (exists) {
                    return res.status(409).send({ message: "SKU already exists" });
                }
                product.sku = sku;
            }

            const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
            const fileRecords = [];
            for (const f of files) {
                const publicUrl = `/uploads/${f.filename}`;
                const created = await File.create({
                    ownerType: "product",
                    ownerId: product._id,
                    url: publicUrl,
                    mime: f.mimetype,
                    size: f.size
                });
                fileRecords.push(created);
            }
            if (title !== undefined) product.title = title;
            if (description !== undefined) product.description = description;
            if (price !== undefined) product.price = price;
            if (currency !== undefined) product.currency = currency;
            if (fileRecords !== undefined) product.images = fileRecords.map(fr => fr.filename);
            if (isActive !== undefined) product.isActive = isActive;
            
            await product.save();
            await logActivity({
                userId,
                type: "PRODUCT_UPDATED",
                payload: { product }
            });
            return res.status(200).send({ message: "Product updated successfully", product });
        } catch (err) {
            console.log(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }


    async deleteProduct(req, res) {
        if (!req.user || !req.params) {
            return res.status(400).send({ message: "productId is required" });
        }

        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;

            const user = await User.findById(userId);
            if (!user || !user.tokenVersion) {
                return res.status(404).send({ message: "User not found" });
            }

            const vendor = await Vendor.findOne({ userId });
            if (!vendor) return res.status(403).send({ message: "Vendor not found" });

            const store = await Store.findOne({ vendorId: vendor._id });
            if (!store) return res.status(404).send({ message: "Store not found" });

            const deleted = await Product.findOneAndDelete({
                _id: id,
                storeId: store._id
            });

            if (!deleted) {
                return res.status(404).send({ message: "Product not found" });
            }

            return res.status(200).send({ message: "Product deleted", deleted });
        } catch (err) {
            console.log(err);
            return res.status(500).send({ message: "Internal server error!" });
        }
    }

}

export default new ProductController();