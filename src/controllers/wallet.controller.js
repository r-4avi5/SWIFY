import {getWalletService} from "../services/wallet.service.js";
import {getWalletBalanceService} from "../services/wallet.service.js";

export const getWallet = async (req, res) => {
    try {
        const wallet = await getWalletService(req.user._id);
        res.status(200).json({
            success: true,
            message: "Wallet retrieved successfully",
            data: wallet
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getWalletBalance = async(req,res) =>{
    try{
        const wallet = await getWalletBalanceService(req.user._id);
        res.status(200).json({
            success: true,
            message: "Wallet retrieved successfully",
            data: wallet
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};