import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Bell } from "lucide-react";
import NotificationList from "../Notification/NotificationList";
import socket from "../../utils/socket"; // Doğru import yolu

const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const toggleTheme = () => setDarkMode(!darkMode);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/users", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Kullanıcı bilgisi alınamadı:", err);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            window.location.href = "/";
        } catch (err) {
            console.error("Çıkış yapılamadı:", err);
        }
    };

    const toggleNotificationBox = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    const fetchNotifications = async () => {
        if (user) {
            try {
                const res = await fetch(`http://localhost:8080/api/notifications`, {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const resJson = await res.json();
                    const notificationsData = resJson.data || [];
                    setNotifications(notificationsData);
                    const unreadCount = notificationsData.filter(n => !n.isRead).length;
                    setNotificationCount(unreadCount);
                }
            } catch (err) {
                console.error("Bildirimler alınamadı:", err);
            }
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: "PUT",
                credentials: "include",
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
                );
                setNotificationCount(prevCount => Math.max(prevCount - 1, 0));
            } else {
                console.error("Bildirim okundu olarak işaretlenemedi");
            }
        } catch (error) {
            console.error("Bildirim okundu olarak işaretlenirken hata:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Socket bağlantısını dinle ve bildirimleri güncelle
    useEffect(() => {
        const handleNewNotification = (notification) => {
            // Kullanıcının kendi gönderdiği bildirimleri saymamak için
            if (user && notification.user !== user._id) {
                setNotifications(prev => [notification, ...prev]);
                setNotificationCount(prevCount => prevCount + 1);
            }
        };

        socket.on("notification", handleNewNotification);

        return () => {
            socket.off("notification", handleNewNotification);
        };
    }, [user]);

    return (
        <header className="sticky top-0 z-50 w-full border-b p-3 bg-white backdrop-blur">
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }} className="py-4 flex justify-between items-center">
                <Link to="/" className="hidden font-bold text-slate-700 sm:inline-block text-2xl">
                    FreeLance
                </Link>

                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition">Anasayfa</Link>
                    <Link to="/" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition">Hakkımızda</Link>
                    <Link to="/" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition">Servisler</Link>
                    <Link to="/" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition">İletişim</Link>
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="text-sm px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition">Profil</Link>
                            <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition">Çıkış Yap</button>

                            {/* Bildirim İkonu */}
                            <button
                                onClick={toggleNotificationBox}
                                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-200 transition"
                                title="Bildirimler"
                            >
                                <Bell size={20} />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition">Giriş Yap</Link>
                            <Link to="/register" className="text-sm px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition">Kayıt Ol</Link>
                        </>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition"
                        title="Tema Değiştir"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Bildirim Kutusu */}
            {isNotificationOpen && (
                <NotificationList
                    notifications={notifications}
                    markAsRead={markAsRead}
                />
            )}
        </header>
    );
};

export default Navbar;