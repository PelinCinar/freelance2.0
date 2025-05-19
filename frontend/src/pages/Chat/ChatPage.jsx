import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input } from "antd";
import { jwtDecode } from "jwt-decode";
import socket from "../../utils/socket";

const ChatPage = () => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!projectId) return;

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

        socket.connect();// autoConnect false ise manuel bağla

        socket.emit("joinRoom", { roomId: projectId, username });

        socket.on("roomUsers", (data) => {
            setUsers(data.users);
        });

        socket.on("newMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("previousMessages", (msgs) => {
            setMessages(msgs);
        });

        socket.on("disconnect", () => {
            console.log(" bağlantı kesildi");
        });

        return () => {
            socket.off("joinRoom");
            socket.off("roomUsers");
            socket.off("newMessage");
            socket.off("previousMessages");
            socket.off("disconnect");
        };
    }, [projectId]);

    const sendMessage = () => {
        if (messageContent.trim()) {
            socket.emit("sendMessage", messageContent);
            setMessageContent("");
        }
    };

    return (
        <div>
            <h2>Chat - Project: {projectId}</h2>
            <div style={{ height: "400px", overflowY: "scroll", border: "1px solid #ddd", marginBottom: "20px" }}>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p><strong>{message.senderUsername || message.sender}:</strong> {message.content}</p>
                    </div>
                ))}
            </div>
            <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Mesajınızı yazın"
                style={{ marginBottom: "10px" }}
            />
            <Button onClick={sendMessage} type="primary">Gönder</Button>
            <div>
                <h4>Online Kullanıcılar:</h4>
                <ul>
                    {users.map((user, index) => (<li key={index}>{user}</li>))}
                </ul>
            </div>
        </div>
    );
};

export default ChatPage;