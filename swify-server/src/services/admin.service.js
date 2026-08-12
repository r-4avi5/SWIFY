import mongoose, { startSession } from "mongoose";

import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import KYC from "../models/kyc.model.js";

import { generatePayAddress } from "./payAddress.service.js";
import { generateQRCode } from "../utils/generateQRCode.js";
import { sendKycApprovedNotification,sendKycRejectedNotification } from "./notification.service.js";

export const reviewKYCService = async (userId, data) => {

    const { action, reason } = data;

    switch (action) {

        case "APPROVE":
            return await approveKYCService(userId);

        case "REJECT":
            return await rejectKYCService(userId, reason);

        default:
            throw new Error("Invalid review action.");

    }

};

export const approveKYCService = async(userId) =>{
    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        const user = await User.findById(userId).session(session);

        if(!user){
            throw new Error("User not found");
        }
        
        const kyc = await KYC.findOne({
            user:user._id,
        }).session(session);

         if(!kyc){
            throw new Error("KYC not done");
        }
         if (kyc.status !== "UNDER_REVIEW") {
            throw new Error("KYC is not under review.");
        }

         const wallet = await Wallet.findOne({
            user: user._id,
        }).session(session);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        const payAddress = await generatePayAddress(
            user.displayName
        );

        const qrPayload = {
            version: 1,
            type: "PERSON",
            displayName: user.displayName,
            payAddress,
        };

        const qrCodeImage = await generateQRCode(
            qrPayload
        );

        user.payAddress = payAddress;
        user.qrCodeImage = qrCodeImage;

        await user.save({ session });

        wallet.status = "ACTIVE";
        await wallet.save({ session });

        kyc.status = "VERIFIED";
        kyc.verifiedAt = new Date();

        await kyc.save({ session });

        await session.commitTransaction();

        await sendKycApprovedNotification({
        receiver: kyc.user,
        });

        return {
            user: {
                id: user._id,
                displayName: user.displayName,
                payAddress: user.payAddress,
                qrCodeImage: user.qrCodeImage,
            },
            wallet: {
                balance: wallet.balance,
                status: wallet.status,
            },
            kyc: {
                status: kyc.status,
                verifiedAt: kyc.verifiedAt,
            },
        };
     } catch(error){
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
     }
};

export const rejectKYCService = async(userId,reason) =>{
        const session = await mongoose.startSession();

        try {
        session.startTransaction();
         const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found.");
        }
        const kyc = await KYC.findOne({
            user: user._id,
        }).session(session);
        if (!kyc) {
            throw new Error("KYC record not found.");
        }
        if (kyc.status !== "UNDER_REVIEW") {
            throw new Error("KYC is not under review.");
        }
        kyc.status = "REJECTED";
        kyc.rejectionReason = reason;
        await kyc.save({ session });
        await session.commitTransaction();

        await sendKycRejectedNotification({
        receiver: kyc.user,
        reason,
        });

        return {
            message: "KYC rejected successfully.",
            data: {
                status: kyc.status,
                rejectionReason: kyc.rejectionReason,
            },
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
}
};