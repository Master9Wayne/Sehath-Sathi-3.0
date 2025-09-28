import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails
} from "../controllers/user.controller.js";

const router = Router();

// --- PUBLIC ROUTES ---
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// --- SECURED ROUTES ---
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").put(verifyJWT, updateAccountDetails);

export default router;