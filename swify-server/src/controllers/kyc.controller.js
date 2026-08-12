import {submitKYCService,getKycStatusService} from "../services/kyc.service.js";

export const submitKYC = async(req,res) =>{
        try{
            const kyc = await submitKYCService(
                                req.user._id,
                                req.body,
            );
            res.status(200).json({
                success:true,
                message:"KYC submitted successfully.",
                data:kyc,
            });
        } catch (error){
            res.status(400).json({
                success:false,
                message:error.message,
            });
        }
};

export const getKycStatus = async (req, res) => {
    try {
        const status = await getKycStatusService(req.user._id);
        res.status(200).json({
            success: true,
            message: "KYC status retrieved successfully.",
            data: status,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};