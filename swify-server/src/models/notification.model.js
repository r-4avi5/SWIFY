import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";

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
            enum:Object.values(NOTIFICATION_TYPES)
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