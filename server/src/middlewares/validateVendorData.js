export default async function validateVendorData(req, res, next) {
    const {companyName} = req.body;

    if (!companyName || companyName.trim().length <= 1) {
        return res.status(400).send({ message: 'Invalid company name' });
    }

    next();
}