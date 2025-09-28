import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js";

// --- Utility function to generate tokens and set cookies ---
const generateAccessAndRefreshTokens = async (userId, res) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options);

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};

// --- Controller for User Registration ---
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, phonenumber } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Full name, email, and password are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        phonenumber
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// --- Controller for User Login ---
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const response = await generateAccessAndRefreshTokens(user._id, res);

    return response.json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"));
});

// --- Controller for User Logout (Protected Route) ---
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// --- Controller to Get Current User Details (Protected Route) ---
const getCurrentUser = asyncHandler(async (req, res) => {
    // The user object is attached to req by the verifyJWT middleware
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

// --- Controller to Update User Details (Protected Route) ---
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, phonenumber } = req.body;

    if (!fullName && !phonenumber) {
        throw new ApiError(400, "Full name or phone number is required to update.");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, phonenumber } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails
};