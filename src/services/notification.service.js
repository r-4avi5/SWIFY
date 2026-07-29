import Notification from "../models/notification.model.js";
import { emitNotification } from "../socket/notification.socket.js";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";

export const createNotification = async({receiver,title,message,type,metadata={},}) =>{
    
    const notification = await Notification.create({receiver,title,message,type,metadata});
    emitNotification(receiver,notification);
    return notification;
};

export const getNotificationsService = async(userId,page=1,limit=20) =>{
    const skip = (page-1)*limit;

    const totalNotifications = await Notification.countDocuments({receiver:userId});
    const notifications = await Notification.find({receiver:userId})
                                            .sort({createdAt: -1})
                                            .skip(skip)
                                            .limit(limit);

    return {
        page,
        limit,
        totalNotifications,
        totalPages: Math.ceil(totalNotifications/limit),
        notifications,
    };                                        
};

export const getUnreadNotificationCountService = async(userId) =>{
    return await Notification.countDocuments({
        receiver:userId,
        isRead:false,
    });
};

export const markNotificationAsReadService = async(notificationId,userId)=>{
    const notification = await Notification.findOne({
        _id:notificationId,
        receiver:userId
    });
    if(!notification){
        throw new Error("Notification not found.");
    }
    notification.isRead = true;
    await notification.save();
    return notification;
};

export const markAllNotificationAsReadService = async(userId) =>{
    await Notification.updateMany({
        receiver:userId,
        isRead:false,
    },
    {
        isRead:true,
    }
);
};

export const deleteNotificationService = async(notificationId,userId) =>{
    const notification = await Notification.findOne({
        _id:notificationId,
        receiver:userId,
    });
    if(!notification) {
        throw new Error ("Notification not found.");
    }
    await notification.deleteOne();
};

export const sendPaymentSentNotification = async(receiver,amount,receiverName,reference) =>{
    return await createNotification({
        receiver,
        title: "Payment Sent",
        message: `You sent ₹${amount} to ${receiverName}.`,
        type: NOTIFICATION_TYPES.PAYMENT_SENT,
        metadata: {
            amount,
            receiverName,
            reference,
        },
    });

};

export const sendPaymentReceivedNotification = async(receiver,amount,senderName,reference) =>{
    return await createNotification({
        receiver,
        title: "Payment Received",
        message: `${senderName} sent you ₹${amount}.`,
        type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
        metadata: {
            amount,
            senderName,
            reference,
        },
    });
};

export const sendKycSubmittedNotification = async(receiver) =>{
    return await createNotification({
        receiver,
        title: "KYC Submitted",
        message: "Your KYC has been submitted successfully.",
        type: NOTIFICATION_TYPES.KYC_SUBMITTED,
    });
};

export const sendKycApprovedNotification = async(receiver) =>{
    return await createNotification({
        receiver,
        title: "KYC Approved",
        message: "Your KYC has been approved successfully.",
        type: NOTIFICATION_TYPES.KYC_APPROVED,
    });
};

export const sendKycRejectedNotification = async(receiver,reason) =>{
    return await createNotification({
        receiver,
        title: "KYC Rejected",
        message: `Your KYC was rejected. ${reason}`,
        type: NOTIFICATION_TYPES.KYC_REJECTED,
        metadata: {
            reason,
        },
    });
};

export const sendMpinCreatedNotification = async(receiver) =>{
    return await createNotification({
        receiver,
        title: "MPIN Created",
        message: "Your MPIN has been created successfully.",
        type: NOTIFICATION_TYPES.MPIN_CREATED,
    });
};

export const sendMpinChangedNotification = async(receiver) =>{
    return await createNotification({
        receiver,
        title: "MPIN Changed",
        message: "Your MPIN has been changed successfully.",
        type: NOTIFICATION_TYPES.MPIN_CHANGED,
    });
};