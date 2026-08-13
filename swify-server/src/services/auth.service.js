import User from "../models/user.model.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { validateRegisterData,validateLoginData } from "../validations/auth.validation.js";
import Wallet from "../models/wallet.model.js";
import KYC from "../models/kyc.model.js";

export const registerUserService = async (userData) => {
    validateRegisterData(userData);

    const {email, phone, swifyId } = userData;
    const existingUser = await User.findOne({ 
        $or: [
             { email },
             { phone },
             { swifyId }
            ]
            });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error("Email already exists");
        }
        if (existingUser.phone === phone) {
            throw new Error("Phone number already exists");
        }
        if (existingUser.swifyId === swifyId) {
            throw new Error("Swify ID already exists");
        }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    userData.payAddress = `${userData.swifyId}@swify`;

     const user = await User.create(userData);
     await Wallet.create(
        { user: user._id, status: "suspended" } // activated on KYC approval
    );
     await KYC.create(
        { user: user._id }
    ); // required — submitKYCService throws "KYC record not found" without this

    const userObject = user.toObject();
    delete userObject.password;

    // Auto-login right after registration — matches loginUserService's
    // shape so the controller can set the same auth cookie either way.
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        user: userObject,
        token,
    };
};

export const loginUserService = async (loginData) => {
    validateLoginData(loginData);
    const { email, password } = loginData;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { id: user._id,}, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" });

    const userObject = user.toObject();
    delete userObject.password;

    return {
        user: userObject,
        token
    };
};