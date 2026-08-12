import User from "../models/user.model.js";
import KYC from "../models/kyc.model.js";

export const resolveUser = async (identifier) => {

    const user = await User.findOne({
        $or: [
            { phone: identifier },
            { payAddress: identifier.toLowerCase() },
            {swifyId: identifier},
        ]
    }).select("-password -mpin");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export const getUserKycStatus = async (userId) =>{
    const kyc = await KYC.findOne({user:userId});
    return kyc?.status || "NOT_SUBMITTED";
}