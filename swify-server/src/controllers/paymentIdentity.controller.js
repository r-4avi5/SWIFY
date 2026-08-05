import {resolveUser} from "../services/paymentIdentity.service.js";

export const resolvePaymentUser = async (req, res) => {
    try {
        const { identifier } = req.body;

        const user = await resolveUser(identifier);
        res.status(200).json({
            success: true,
            message: "User resolved successfully",
            data: {
                fullName: user.fullName,
                payAddress: user.payAddress,
                swifyId: user.swifyId,
                kycStatus: user.kycStatus,
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
