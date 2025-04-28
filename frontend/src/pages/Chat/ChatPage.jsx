import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Button, Input } from "antd";
import { jwtDecode } from "jwt-decode";

// const token = localStorage.getItem("accessToken");

const socket = io("http://localhost:8080", {
  withCredentials: true,
  transports: ['websocket'], // sadece websocket kullanmak istersen
});

const ChatPage = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [users, setUsers] = useState([]);

  // Kullanıcı odaya katıldığında
  useEffect(() => {
    // if (!socket || !projectId) return; 
    const token = localStorage.getItem("accessToken");
    let username = "Misafir";
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        username = decoded.name || "Misafir";
      } catch (err) {
        console.error("JWT çözümlenemedi:", err.message);
      }
    }
  
    socket.emit("joinRoom", { roomId: projectId, username });
  
    // Odaya katılan kullanıcılar
    socket.on("roomUsers", (data) => {
      setUsers(data.users);
    });
  
    // Yeni gelen mesaj
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
  
    // Odaya girince gelen geçmiş mesajlar
    socket.on("previousMessages", (msgs) => {
      setMessages(msgs); // doğrudan tüm mesajları state'e yaz
    });
  
    return () => {
      socket.off("newMessage");
      socket.off("roomUsers");
      socket.off("previousMessages");
    };
  }, [socket, projectId]);
  
  

  // Mesaj gönderme fonksiyonu
  const sendMessage = () => {
    if (messageContent.trim()) {
      socket.emit("sendMessage", messageContent); // Mesajı odada herkese gönder
      setMessageContent(""); // Mesajı temizle
    }
  };

  return (
    <div>
      <h2>Chat - Project: {projectId}</h2>
      <div
        style={{
          height: "400px",
          overflowY: "scroll",
          border: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        {messages.map((message, index) => (
          <div key={index}>
            <p>
              <strong>{message.senderUsername || message.sender}:</strong>{" "}
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <div>
        <Input
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Mesajınızı yazın"
          style={{ marginBottom: "10px" }}
        />
        <Button onClick={sendMessage} type="primary">
          Gönder
        </Button>
      </div>

      <div>
        <h4>Online Kullanıcılar:</h4>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatPage;
