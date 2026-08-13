import {reviewKYCService, getPendingKYCListService, getKYCDetailService} from "../services/admin.service.js";

export const listPendingKYC = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await getPendingKYCListService(page, limit);

        res.status(200).json({
            success: true,
            message: "Pending KYC submissions retrieved successfully.",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getKYCDetail = async (req, res) => {
    try {
        const detail = await getKYCDetailService(req.params.userId);

        res.status(200).json({
            success: true,
            message: "KYC detail retrieved successfully.",
            data: detail,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const reviewKYC = async(req,res) =>{

    try{
        const result = await reviewKYCService(
            req.params.userId,
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