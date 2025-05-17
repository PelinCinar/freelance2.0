import React, { useEffect, useState } from 'react';
import NotificationBox from './NotificationBox';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/notifications', {
        credentials: 'include',
      });
      const data = await res.json();
      setNotifications(data.data);
    } catch (err) {
      console.error('Bildirimler alınamadı', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  useEffect(() => {
    fetchNotifications();

  }, []);

  return (
    <div className="absolute right-0 top-12 bg-white border w-80 max-h-[400px] overflow-y-auto shadow-md rounded-lg p-2 z-50">
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">Bildirim yok</p>
      ) : (
        notifications.map((notif) => (
          <NotificationBox
            key={notif._id}
            notification={notif}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;
