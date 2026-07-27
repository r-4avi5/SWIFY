import {getTransactionHistoryService,getTransactionByReferenceService} from "../services/transaction.service.js"

export const getTransactionHistory = async(req,res) =>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20,50);
        const transactions = getTransactionHistoryService(
            req.user._id,
            page,
            limit,
        );
        res.status(200).json({
            success:true,
            ...transactions,
        });
    } catch (error){
        res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};

export const getTransactionByReference = async(req,res) =>{
    try{
        const transaction = await getTransactionByReferenceService(
                                    req.user._id,
                                    req.params.reference
        );
        res.status(200).json({
            success:true,
            data:transaction,
        });
    } catch(error){
         res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};
