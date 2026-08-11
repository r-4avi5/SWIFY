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

    kyc.aadhaarNumber = data.aadhaarNumber,
    kyc.panNumber = data.panNumber,
    kyc.documents ={
        aadhaarFront: data.aadharFront,
        aadhaarBack: data.aadhaarBack,
        panCard: data.panCard,
        selfie: data.selfie,
    };

    kyc.status = "UNDER_REVIEW";
    await kyc.save();

    await sendKycSubmittedNotification({
    receiver: userId,
    });

    return kyc;
};