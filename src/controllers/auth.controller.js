import {registerUserService} from "../services/auth.service.js";

export const registerUser = async (req, res) => {
    try {
        const user = await registerUserService(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};