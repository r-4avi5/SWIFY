import { createMpinService,verifyMpinService,changeMpinService } from "../services/mpin.service.js";

export const createMpin = async(req,res) =>{
    try{
        const result = await createMpinService(req.user._id,req.body);

        return res.status(201).json({
            success:true,
            message:result.message
        });
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};

export const verifyMpin = async(req,res) =>{
    try{
        const result = await verifyMpinService(req.user._id,req.body);

        return res.status(201).json({
            success:true,
            message:result.message
        });
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};

export const changeMpin = async(req,res) =>{
    try{
        const result = await changeMpinService(req.user._id,req.body);

        return res.status(201).json({
            success:true,
            message:result.message
        });
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};
