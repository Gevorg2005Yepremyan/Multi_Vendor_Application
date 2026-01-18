import express from "express";
import { connectDB } from "./server/src/config/db.js";
import { env } from "./server/src/config/env.js";
import userRouter from "./server/src/routes/users.js";
import roleRouter from "./server/src/routes/roles.js";
import accountRouter from "./server/src/routes/accounts.js";
import authRouter from "./server/src/routes/auth.js";
import vendorRouter from "./server/src/routes/vendors.js";
import storeRouter from "./server/src/routes/stores.js";
import productRouter from "./server/src/routes/products.js";
import inventoryRouter from "./server/src/routes/inventories.js";
import orderRouter from "./server/src/routes/orders.js";
import adminRouter from "./server/src/routes/admin.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./server/src/config/swagger.js";

const PORT = env.APP_PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/account", accountRouter);
app.use("/role", roleRouter);
app.use("/vendor", vendorRouter);
app.use("/store", storeRouter);
app.use("/product", productRouter);
app.use("/inventory", inventoryRouter);
app.use("/order", orderRouter);
app.use("/admin", adminRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
});