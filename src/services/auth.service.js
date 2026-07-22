import User from "../models/user.model.js";
import { validateRegisterData } from "../validations/auth.validation.js";

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

    const user = await User.create(userData);

    return user;
};