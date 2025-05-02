import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Moon, Sun, Bell } from "lucide-react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]); // Bildirimler için state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Bildirim kutusunun açık olup olmadığını kontrol etmek için

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users", {
          method: "GET",
          credentials: "include", // Cookie'yi gönderiyoruz
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
      window.location.href = "/"; // anasayfaya yönlendir
    } catch (err) {
      console.error("Çıkış yapılamadı:", err);
    }
  };

  const fetchNotifications = async () => {
    if (user) {
      try {
        const res = await fetch(`http://localhost:8080/api/notifications`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data); // Bildirimleri state'e aktar
        }
      } catch (err) {
        console.error("Bildirimler alınamadı:", err);
      }
    }
  };

  useEffect(() => {
    console.log(user); // Burada user'ı loglayarak kontrol et
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const toggleNotificationBox = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur ">
      <div className="container mx-auto px-32 py-4  flex justify-between items-center">
        <Link
          to="/"
          className="hidden font-bold text-slate-700 sm:inline-block text-2xl"
        >
          FreeLance
        </Link>

        <nav className="hidden md:flex space-x-6 ">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition"
          >
            Anasayfa
          </Link>
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition"
          >
            Hakkımızda
          </Link>
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition"
          >
            Servisler
          </Link>
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition"
          >
            İletişim
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-sm px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Çıkış Yap
              </button>
              {/* Bildirim İkonu */}
              <button
                onClick={toggleNotificationBox}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition"
                title="Bildirimler"
              >
                <Bell size={20} />
                {/* Bildirim sayısı varsa göster */}
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {notifications.length}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition"
              >
                Kayıt Ol
              </Link>
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
        <div className="absolute right-10 top-16 bg-white shadow-lg rounded-lg p-4 max-w-xs">
          <h3 className="font-bold mb-2">Bildirimler</h3>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index} className="text-sm py-1">
                  {notification.message}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">Yeni bildirim yok.</li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
