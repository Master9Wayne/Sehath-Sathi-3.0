// fileName: app.js
// Core imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 

// Utility imports
import { ApiError } from "./utilities/ApiError.js";

// Routers
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.routes.js";
import medicineRouter from "./routes/medicine.routes.js";
import scheduleRouter from "./routes/schedule.routes.js";
import medScheduleRouter from "./routes/medicineschedule.routes.js";

// FIX IMPORTS: Import controller and middleware directly for the singular DELETE route fix
import { deletePatient } from "./controllers/patient.controller.js"; 
import { verifyJWT } from "./middleware/auth.middleware.js"; // <--- Fixes broken auth

// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
	origin: 'http://localhost:3000', 
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// --- ROUTES DECLARATION ---
const API_VERSION = "/api/v1";

app.use(`${API_VERSION}/users`, userRouter);
// Keep plural path for main router to preserve list fetch (GET /patients)
app.use(`${API_VERSION}/patients`, patientRouter); 
app.use(`${API_VERSION}/medicine`, medicineRouter);
app.use(`${API_VERSION}/schedule`, scheduleRouter);
app.use(`${API_VERSION}/med-schedules`, medScheduleRouter);

// FIX: Explicitly add a singular DELETE route (DELETE /patient/:id) to satisfy the frontend's delete call.
app.delete(`${API_VERSION}/patient/:id`, verifyJWT, deletePatient); 

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
