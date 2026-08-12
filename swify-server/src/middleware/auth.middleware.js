import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies);
        const token = req.cookies.token;
        console.log("Token:", token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please log in first."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
         console.log("Decoded:", decoded);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. User not found."
            });
        }

        req.user = user;
        next();

    } catch (error) {
         console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again."
        });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin access required.",
        });
    }
    next();
};