// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

const socket = io(SOCKET_URL, {
  withCredentials: true,//tarayıcıdan sunuya kimlik bilgileri gidiyor.Sunucuda JWT cookie kullanıyorsa bu zorunlu unutma!!
  autoConnect: false, // otomatik bağlanma yerine kontrollü bağlantı önerilir bu sayede kullanıcı login olduktn sonra başlatabilirz.
  transports: ["websocket"],//sadece websocket protokğlünü kullan.
});

export default socket;
