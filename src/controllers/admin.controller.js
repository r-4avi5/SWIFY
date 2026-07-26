import {reviewKYCService} from "../services/admin.service.js";

export const reviewKYC = async(req,res) =>{

    try{
        const result = await reviewKYCService(
            userId,
            req.body,
        );

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
        });

    } catch(error){
         res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};