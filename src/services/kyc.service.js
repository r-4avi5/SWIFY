import KYC from "../models/kyc.model.js";
import { validateKYCData } from "../validations/kyc.validation.js";

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

    kyc.aadharNumber = data.aadharNumber,
    kyc.panNumber = data.panNumber,
    kyc.documents ={
        aadharFront: data.aadharFront,
        aadharBack: data.aadharBack,
        panCard: data.panCard,
        selfie: data.selfie,
    };

    kyc.status = "UNDER_REVIEW";
    await kyc.save();

    return kyc;
};