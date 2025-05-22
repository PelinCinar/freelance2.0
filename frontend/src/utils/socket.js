// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:8080", {
  withCredentials: true,//tarayıcıdan sunuya kimlik bilgileri gidiyor.Sunucuda JWT cookie kullanıyorsa bu zorunlu unutma!!
  autoConnect: false, // otomatik bağlanma yerine kontrollü bağlantı önerilir bu sayede kullanıcı login olduktn sonra başlatabilirz.
  transports: ["websocket"],//sadece websocket protokğlünü kullan.
});

export default socket;
