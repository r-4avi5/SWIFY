import mongoose from "mongoose";
 
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import KYC from "../models/kyc.model.js";
 
import { generatePayAddress } from "./payAddress.service.js";
import { generateQRCode } from "../utils/generateQRCode.js";
import { sendKycApprovedNotification,sendKycRejectedNotification } from "./notification.service.js";
 
// Lists KYC submissions currently awaiting admin action, newest first.
export const getPendingKYCListService = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
 
    const filter = { status: "UNDER_REVIEW" };
 
    const totalSubmissions = await KYC.countDocuments(filter);
 
    const submissions = await KYC.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "fullName displayName email phone swifyId avatar");
 
    return {
        page,
        limit,
        totalSubmissions,
        totalPages: Math.ceil(totalSubmissions / limit),
        submissions: submissions.map((k) => ({
            id: k._id,
            userId: k.user?._id,
            fullName: k.user?.fullName,
            displayName: k.user?.displayName,
            email: k.user?.email,
            phone: k.user?.phone,
            swifyId: k.user?.swifyId,
            avatar: k.user?.avatar,
            submittedAt: k.updatedAt,
        })),
    };
};
 
// Full detail for one user's KYC submission, including document images,
// for the admin to actually inspect before approving/rejecting.
export const getKYCDetailService = async (userId) => {
    const kyc = await KYC.findOne({ user: userId }).populate(
        "user",
        "fullName displayName email phone swifyId avatar"
    );
 
    if (!kyc) {
        throw new Error("KYC record not found.");
    }
 
    return {
        status: kyc.status,
        aadharNumber: kyc.aadharNumber,
        panNumber: kyc.panNumber,
        documents: kyc.documents,
        rejectionReason: kyc.rejectionReason || null,
        verifiedAt: kyc.verifiedAt || null,
        submittedAt: kyc.updatedAt,
        user: {
            id: kyc.user?._id,
            fullName: kyc.user?.fullName,
            displayName: kyc.user?.displayName,
            email: kyc.user?.email,
            phone: kyc.user?.phone,
            swifyId: kyc.user?.swifyId,
            avatar: kyc.user?.avatar,
        },
    };
};
 
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
 
        wallet.status = "active";
        await wallet.save({ session });
 
        kyc.status = "VERIFIED";
        kyc.verifiedAt = new Date();
 
        await kyc.save({ session });
 
        await session.commitTransaction();
 
        await sendKycApprovedNotification(kyc.user);
 
        return {
            message: "KYC approved successfully.",
            data: {
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
 
        await sendKycRejectedNotification(kyc.user, reason);
 
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