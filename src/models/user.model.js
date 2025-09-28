// fileName: user.model.js

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // Ensure bcrypt is imported

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phonenumber: {
        type: String, 
    },
    patientsList: [{
        type: Schema.Types.ObjectId,
        ref: "Patient"
    }],
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// CRITICAL FIX: Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
    // Only hash the password if it is new or has been modified
    if (!this.isModified("password")) return next(); 

    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// CRITICAL FIX: Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function(password){
    // Use bcrypt.compare to compare the plaintext password with the hash
    return await bcrypt.compare(password, this.password);
}

// Method to generate a short-lived access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Method to generate a long-lived refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);