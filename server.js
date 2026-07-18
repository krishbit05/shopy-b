import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

const normalizeOrigin = (origin) => origin.replace(/\/$/, "");

const envOrigins = (process.env.CORS_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim())
	.map((origin) => normalizeOrigin(origin))
	.filter(Boolean);

const allowedOrigins = [
	...envOrigins,
	process.env.CLIENT_URL,
	"http://localhost:5173",
	"http://127.0.0.1:5173",
]
	.filter(Boolean)
	.map((origin) => normalizeOrigin(origin));

const corsOptions = {
	origin: (origin, callback) => {
		const normalizedRequestOrigin = origin ? normalizeOrigin(origin) : origin;

		// Allow non-browser requests (like curl/Postman) and configured browser origins.
		if (!normalizedRequestOrigin || allowedOrigins.includes(normalizedRequestOrigin)) {
			return callback(null, true);
		}

		return callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
};

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});
