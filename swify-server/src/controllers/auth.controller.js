import {registerUserService} from "../services/auth.service.js";
import {loginUserService} from "../services/auth.service.js";

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

export const loginUser = async (req, res) => {
    try {
        const user = await loginUserService(req.body);

        res.cookie("token", user.token, { 
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: user,
        });
    } catch (error) {
        res.status(400).json({
            success: false, 
            message: error.message
        });
    }
};
