import React, { useEffect, useState } from "react";
import { Button, Input, List } from "antd";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:8080"); // Socket.IO sunucusuna bağlan

const Chat = () => {
  const { projectId } = useParams(); // Proje ID'sini almak
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Proje odasına katıl
    socket.emit("joinRoom", { roomId: projectId, username: "employerOrFreelancer" });

    // Mesajları al
    socket.on("previousMessages", (messages) => {
      setMessages(messages);
    });

    // Yeni mesaj geldiğinde
    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Temizleme
    return () => {
      socket.off("previousMessages");
      socket.off("newMessage");
    };
  }, [projectId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { content: message, roomId: projectId });
      setMessage(""); // Mesajı gönderdikten sonra inputu temizle
    }
  };

  return (
    <div>
      <div style={{ height: "400px", overflowY: "scroll" }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item>
              <strong>{msg.senderUsername}:</strong> {msg.content}
            </List.Item>
          )}
        />
      </div>

      <div>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajınızı yazın"
        />
        <Button onClick={sendMessage}>Gönder</Button>
      </div>
    </div>
  );
};

export default Chat;
