// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:8080", {
  withCredentials: true,
  autoConnect: false, // otomatik bağlanma yerine kontrollü bağlantı önerilir
  transports: ["websocket"],
});

export default socket;
