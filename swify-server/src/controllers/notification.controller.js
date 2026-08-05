import { getNotificationsService,
        getUnreadNotificationCountService,
        markNotificationAsReadService,
        markAllNotificationAsReadService,
        deleteNotificationService } from "../services/notification.service.js";

        export const getNotifications = async (req,res) =>{
            try{
                const page = Number(req.query.page) || 1;
                 const limit = Number(req.query.limit) || 20;

                 const notifications = await getNotificationsService(req.user._id,page,limit);
                 return res.status(201).json({
                    success:true,
                    data:notifications,
                 })
            } catch(error) {
                res.status(400).json({
                    success:false,
                    message:error.message,
                });
            }
        };

        export const getUnreadNotificationCount = async(req,res) =>{
            try{
                 const count = await getUnreadNotificationCountService(req.user._id);
                 return res.status(201).json({
                    success:true,
                    data:{
                        unreadCount:count,
                    },
                 })
            } catch(error) {
                res.status(400).json({
                    success:false,
                    message:error.message,
                });
            }
        };

        export const markNotificationAsRead = async(req,res) =>{
            try{
                 const notification = await markNotificationAsReadService(req.params.id,req.user._id);
                 return res.status(201).json({
                    success:true,
                    message:"Notification marked as true",
                    data: notification,
                 })
            } catch(error) {
                res.status(400).json({
                    success:false,
                    message:error.message,
                });
            }
        };

         export const markAllNotificationAsRead = async(req,res) =>{
            try{
                 const notification = await markAllNotificationAsReadService(req.user._id);
                 return res.status(201).json({
                    success:true,
                    message:"All Notification marked as true",
                 })
            } catch(error) {
                res.status(400).json({
                    success:false,
                    message:error.message,
                });
            }
        };

         export const deleteNotification = async(req,res) =>{
            try{
                 const notification = await deleteNotificationService(req.params.id,req.user._id);
                 return res.status(201).json({
                    success:true,
                    message:"Notification deleted.",
                 })
            } catch(error) {
                res.status(400).json({
                    success:false,
                    message:error.message,
                });
            }
        };