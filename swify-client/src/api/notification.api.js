import api from "../lib/axios";

// Mirrors swify-server/src/routes/notification.routes.js
export const getNotifications = (page = 1, limit = 20) =>
  api.get("/api/notifications", { params: { page, limit } });

export const getUnreadNotificationCount = () =>
  api.get("/api/notifications/unread-count");

export const markNotificationAsRead = (id) =>
  api.patch(`/api/notifications/${id}/read`);

export const markAllNotificationAsRead = () =>
  api.patch("/api/notifications/read-all");

export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`);
