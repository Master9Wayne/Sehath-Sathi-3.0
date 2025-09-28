// Core imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // <-- Added for reading cookies

// Utility imports
import { ApiError } from "./utilities/ApiError.js";
// ApiResponse is not used, but we can leave it for now
// import { ApiResponse } from "./utilities/ApiResponse.js";

// Routers
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.routes.js";
import medicineRouter from "./routes/medicine.routes.js";
import scheduleRouter from "./routes/schedule.routes.js";
import medScheduleRouter from "./routes/medicineschedule.routes.js";

// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();

// --- DELETED AUTH0 CONFIG ---
// The 'express-openid-connect' config block has been removed.

// --- MIDDLEWARE ---
// --- MIDDLEWARE ---
// --- MIDDLEWARE ---
app.use(cors({
	origin: 'http://localhost:3000', // <-- Hardcode the URL for testing
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // <-- Use cookie-parser middleware

// --- ROUTES DECLARATION ---
// User routes will now handle registration, login, and logout
const API_VERSION = "/api/v1";

app.use(`${API_VERSION}/users`, userRouter);
app.use(`${API_VERSION}/patients`, patientRouter);
app.use(`${API_VERSION}/medicine`, medicineRouter);
app.use(`${API_VERSION}/schedule`, scheduleRouter);
app.use(`${API_VERSION}/med-schedules`, medScheduleRouter);

// --- ERROR HANDLING ---
// 404 handler
app.use((req, res, next) => {
	next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global error handler
app.use((err, req, res, next) => {
	if (err instanceof ApiError) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
			errors: err.errors || [],
			data: null
		});
	}
	// Fallback for unhandled errors
	return res.status(500).json({
		success: false,
		message: err.message || "Internal Server Error",
		errors: [],
		data: null
	});
});

export default app;