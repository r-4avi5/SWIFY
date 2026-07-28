import Notification from "../models/notification.model.js";
import { getIO } from "../socket/socket.js";

export const createNotification = async(receiver,title,message,type,metadata={}) =>{
    
    const notification = await Notification.create({receiver,title,message,type,metadata});
    const io = getIO();

    io.to(receiver.toString()).emit("notification",notification);
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
        totalPages = Math.ceil(totalNotifications/limit),
        notifications,
    };                                        
};

