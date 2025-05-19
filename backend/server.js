require("dotenv").config(); // Ortam değişkenlerini yükle
const app = require("./app.js");
const connectDB = require("./src/config/dbConfig"); // Veritabanı bağlantısı
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken"); // JWT doğrulama için
const Message = require("./src/models/Message");
const Notification = require("./src/models/Notification");
const PORT = process.env.PORT || 8080; // Portu ayarla (8080 olarak değiştirdim)
const cookie = require("cookie");

// HTTP sunucusu oluştur
// console.log("🔐 JWT_SECRET:", process.env.ACCESS_TOKEN_SECRET);

const server = http.createServer(app);

// Socket.IO sunucusunu başlat
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    withCredentials: true,
  },
});

// Veritabanına bağlan
connectDB();

// Aktif kullanıcıları saklamak için Map
const activeUsers = new Map();

//! Socket.IO middleware
io.use((socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) throw new Error("No cookies found");

    const parsedCookies = cookie.parse(rawCookie);
    const token = parsedCookies.accessToken;

    if (!token) throw new Error("No token found");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    // console.error('Authentication error:', err.message);
    next(new Error("Authentication error"));
  }
});

// Socket bağlantılarını dinle
io.on("connection", (socket) => {
  const username = socket.user?.name || "Misafir";
  const userId = socket.user?._id || null;

  socket.on("joinRoom", async ({ roomId }) => {
    console.log("🧩 joinRoom çağrıldı:", roomId, "socketID:", socket.id);

    socket.join(roomId);
    socket.roomId = roomId;

    if (!activeUsers.has(roomId)) {
      activeUsers.set(roomId, new Map());
    }
    activeUsers.get(roomId).set(socket.id, username);

    console.log(`${username} ${roomId} odasına katıldı`);

    io.to(roomId).emit("roomUsers", {
      users: Array.from(activeUsers.get(roomId).values()),
    });
    //!sadece bağlanan kullanıcıya mesaj geçmşini gönderiuo
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(50)
      .lean();
    socket.emit("previousMessages", messages);
  });

  socket.on("sendMessage", async (message) => {
    if (!socket.user) return;

    const newMessage = new Message({
      roomId: socket.roomId,
      sender: socket.user._id,
      senderUsername: socket.user.name,
      content: message,
    });

    await newMessage.save();

    // 1️ - Oda içindeki herkese mesajı gönder
    io.to(socket.roomId).emit("newMessage", {
      sender: socket.user._id,
      senderUsername: socket.user.name,
      content: message,
      timestamp: newMessage.timestamp,
    });

    // 2️ - Oda içindeki diğer kullanıcılara notification gönder ve kaydet
    const roomSockets = await io.in(socket.roomId).fetchSockets();

    // Her kullanıcıya bir kez bildirim oluştur (sender hariç)
    const notifiedUserIds = new Set();

    for (const s of roomSockets) {
      const receiverId = s.user?._id;
      if (
        receiverId &&
        receiverId !== socket.user._id &&
        !notifiedUserIds.has(receiverId)
      ) {
        notifiedUserIds.add(receiverId);

        // Bildirimi veritabanına kaydet
        const notification = new Notification({
          user: receiverId,
          sender: socket.user._id,
          senderUsername: socket.user.name,
          content: message,
          roomId: socket.roomId,
          message: message,
          type: "message", // örnek bir tür
        });
        await notification.save();

        // İlgili kullanıcıya bildirimi anlık gönder
        io.to(s.id).emit("notification", {
          from: socket.user.name,
          content: message,
          roomId: socket.roomId,
          type: "message",
        });
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.roomId) {
      activeUsers.get(socket.roomId)?.delete(socket.id);
      if (activeUsers.get(socket.roomId)?.size === 0) {
        activeUsers.delete(socket.roomId);
      }
      io.to(socket.roomId).emit("roomUsers", {
        users: Array.from(activeUsers.get(socket.roomId)?.values() || []),
      });
    }
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

// Sunucu ayarları
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
