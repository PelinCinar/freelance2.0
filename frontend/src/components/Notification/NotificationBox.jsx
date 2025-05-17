import React from 'react';
import dayjs from 'dayjs';

const NotificationBox = ({ notification, onMarkAsRead, onDelete }) => {
  const { message, isRead, createdAt } = notification;
  const formattedDate = dayjs(createdAt).format('DD/MM/YYYY HH:mm');

  return (
    <div className="p-3 border rounded-md bg-white shadow-sm flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-700">{formattedDate}</span>
        <button
          className="text-red-500 hover:underline"
          onClick={() => onDelete(notification._id)}
        >
          Sil
        </button>
      </div>
      <p className="text-sm">{message}</p>
      <button
        className={`text-white px-3 py-1 rounded ${isRead ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
        disabled={isRead}
        onClick={() => onMarkAsRead(notification._id)}
      >
        {isRead ? "Okundu" : "Okundu Olarak İşaretle"}
      </button>
    </div>
  );
};

export default NotificationBox;
