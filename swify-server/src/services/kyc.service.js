import KYC from "../models/kyc.model.js";
import { validateKYCData } from "../validations/kyc.validation.js";
import { sendKycSubmittedNotification } from "./notification.service.js";

export const submitKYCService = async(userId,data) =>{
    validateKYCData(data);
    const kyc = await KYC.findOne({
                user:userId,
    });

    if(!kyc){
        throw new Error ("KYC record not found");
    }
    if(kyc.status === "UNDER_REVIEW"){
        throw new Error ("Your KYC is already under review");
    }
    if(kyc.status === "VERIFIED"){
        throw new Error ("Your KYC is already verified");
    }

    kyc.aadharNumber = data.aadharNumber;
    kyc.panNumber = data.panNumber;
    kyc.documents = {
        aadharFront: data.aadharFront,
        aadharBack: data.aadharBack,
        panCard: data.panCard,
        selfie: data.selfie,
    };

    kyc.status = "UNDER_REVIEW";
    await kyc.save();

    await sendKycSubmittedNotification(userId);

    return kyc;
};

export const getKycStatusService = async (userId) => {
    const kyc = await KYC.findOne({ user: userId });

    if (!kyc) {
        // Should not happen for any account created after the fix that
        // auto-creates a KYC record at registration, but handled
        // defensively for any pre-existing accounts.
        return { status: "NOT_SUBMITTED" };
    }

    return {
        status: kyc.status,
        rejectionReason: kyc.rejectionReason || null,
        verifiedAt: kyc.verifiedAt || null,
    };
};