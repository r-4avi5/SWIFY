import { getIO } from "./socket.js";
import { SOCKET_EVENTS } from "../constants/socket.events.js";

export const emitNotification = async(userId,notification)=> {

    const io = getIO();
    io.to(userId.toSting()).emit(
        "notification",{
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            metadata: notification.metadata,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        }
    );
};