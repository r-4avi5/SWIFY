import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        title:{
            type:String,
            required:true,
            trim:true,
            maxlength:100
        },
        message:{
            type:String,
            required:true,
            trim:true,
            maxlength:500
        },
        type:{
            type:String,
            required:true,
            enum:[
                "PAYMENT_SENT",
                "PAYMENT_RECEIVED",
                "KYC_SUBMITTED",
                "KYC_APPROVED",
                "KYC_REJECTED",
                "MPIN_CREATED",
                "MPIN_CHANGED",
                "SYSTEM",
            ],
        },
        metadata:{
            type:Object,
            default:{},
        },
        isRead:{
            type:Boolean,
            default:false,
        },
    },
    {timestamps:true},
);

const Notification = mongoose.model("Notification",notificationSchema);

export default Notification;