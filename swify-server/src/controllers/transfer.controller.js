import {
    transferMoneyService,
    transferByQRService,
    scanQRService
} from "../services/transfer.service.js";

export const transferMoney = async (req, res) => {

    try {
        const paymentToken = req.headers["x-payment-authorisation"]
        const result = await transferService(
            req.user._id,
            req.body,
            paymentToken
        );

        return res.status(200).json({
            success: true,
            message: "Transfer completed successfully.",
            data: result,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};

export const transferByQR = async (req, res) => {

    try {

        const result = await transferByQRService(
            req.user._id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "QR Transfer completed successfully.",
            data: result,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};

export const scanQR = async (req, res) => {

    try {

        const result = await scanQRService(req.body);

        return res.status(200).json({
            success: true,
            message: "QR verified successfully.",
            data: result,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};