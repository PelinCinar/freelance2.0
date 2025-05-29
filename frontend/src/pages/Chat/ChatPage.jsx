import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Avatar,
  Typography,
  Space,
  Badge,
  Divider,
  List,
  Tooltip,
  Spin,
  Empty,
  Alert,
  Row,
  Col,
  Tag,
  message as antMessage
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  WifiOutlined,
  DisconnectOutlined
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import socket from "../../utils/socket";
import { API_ENDPOINTS } from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState("");
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [projectInfo, setProjectInfo] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    // Mesajları en alta kaydır
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Proje bilgilerini çek
    const fetchProjectInfo = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.PROJECT_BY_ID(projectId), {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setProjectInfo(data.data);
            }
        } catch (error) {
            console.error("Proje bilgileri alınamadı:", error);
        }
    };

    // Mesaj gönderme
    const sendMessage = () => {
        if (messageContent.trim() && isConnected) {
            socket.emit("sendMessage", messageContent);
            setMessageContent("");
        } else if (!isConnected) {
            antMessage.error("Bağlantı kopuk. Lütfen sayfayı yenileyin.");
        }
    };

    // Enter tuşu ile mesaj gönderme
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Geri dön - Kullanıcı rolüne göre
    const handleGoBack = () => {
        if (currentUser?.role === 'freelancer') {
            navigate('/freelancer-panel/projects');
        } else {
            navigate('/employer-panel/projects');
        }
    };

    // Mesaj zamanını formatla
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    useEffect(() => {
        if (!projectId) return;

        const initializeChat = async () => {
            setIsLoading(true);

            // Proje bilgilerini çek
            await fetchProjectInfo();

            const token = localStorage.getItem("accessToken");
            let username = "Misafir";
            let userInfo = null;

            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    username = decoded.name || "Misafir";
                    userInfo = decoded;
                    setCurrentUser(userInfo);
                } catch (err) {
                    console.error("JWT çözümlenemedi:", err.message);
                    antMessage.error("Oturum bilgileri geçersiz. Lütfen tekrar giriş yapın.");
                    return;
                }
            }

            try {
                socket.connect();
                setIsConnected(true);

                socket.emit("joinRoom", { roomId: projectId, username });

                socket.on("connect", () => {
                    setIsConnected(true);
                    antMessage.success("Sohbete bağlandınız!");
                });

                socket.on("disconnect", () => {
                    setIsConnected(false);
                    antMessage.warning("Bağlantı kesildi. Yeniden bağlanmaya çalışılıyor...");
                });

                socket.on("roomUsers", (data) => {
                    setUsers(data.users);
                });

                socket.on("newMessage", (message) => {
                    setMessages((prev) => {
                        // Aynı mesajın tekrar eklenmesini önle
                        const isDuplicate = prev.some(msg =>
                            msg.content === message.content &&
                            msg.senderUsername === message.senderUsername &&
                            Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000
                        );

                        if (isDuplicate) {
                            return prev;
                        }

                        return [...prev, message];
                    });
                    // Yeni mesaj geldiğinde scroll yap
                    setTimeout(scrollToBottom, 100);
                });

                socket.on("previousMessages", (msgs) => {
                    setMessages(msgs);
                    // Mesajlar yüklendiğinde scroll yap
                    setTimeout(scrollToBottom, 100);
                });

                socket.on("error", (error) => {
                    console.error("Socket hatası:", error);
                    antMessage.error("Bağlantı hatası oluştu.");
                });

            } catch (error) {
                console.error("Socket bağlantı hatası:", error);
                antMessage.error("Sohbete bağlanılamadı.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("joinRoom");
            socket.off("roomUsers");
            socket.off("newMessage");
            socket.off("previousMessages");
            socket.off("error");
            socket.disconnect();
        };
    }, [projectId]);

    // Mesajlar değiştiğinde scroll yap
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large">
                    <div className="p-8">
                        <Text>Sohbet yükleniyor...</Text>
                    </div>
                </Spin>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <Card className="rounded-none border-b shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                            type="text"
                            size="large"
                        />
                        <div className="flex items-center space-x-3">
                            <Avatar
                                size={48}
                                icon={<ProjectOutlined />}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div>
                                <Title level={4} className="mb-0">
                                    {projectInfo?.title || `Proje #${projectId}`}
                                </Title>
                                <Space>
                                    <Text type="secondary">
                                        {isConnected ? (
                                            <><WifiOutlined className="text-green-500" /> Bağlı</>
                                        ) : (
                                            <><DisconnectOutlined className="text-red-500" /> Bağlantı Kesildi</>
                                        )}
                                    </Text>
                                    <Divider type="vertical" />
                                    <Text type="secondary">
                                        <TeamOutlined /> {users.length} Kişi Online
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    </div>

                    {/* Online Kullanıcılar */}
                    <div className="flex items-center space-x-2">
                        {users.slice(0, 3).map((user, index) => (
                            <Tooltip key={index} title={user}>
                                <Avatar
                                    size="small"
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: '#52c41a' }}
                                >
                                    {user.charAt(0).toUpperCase()}
                                </Avatar>
                            </Tooltip>
                        ))}
                        {users.length > 3 && (
                            <Tooltip title={`+${users.length - 3} kişi daha`}>
                                <Avatar size="small" style={{ backgroundColor: '#faad14' }}>
                                    +{users.length - 3}
                                </Avatar>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </Card>

            {/* Chat Messages Area */}
            <div className="flex-1 flex">
                <div className="flex-1 flex flex-col">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-hidden">
                        <div
                            className="h-full overflow-y-auto p-4 space-y-4"
                            style={{ maxHeight: 'calc(100vh - 200px)' }}
                        >
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Henüz mesaj yok. İlk mesajı siz gönderin!"
                                    />
                                </div>
                            ) : (
                                messages.map((message, index) => {
                                    const isOwnMessage = currentUser && message.sender === currentUser._id;
                                    const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;

                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                                        >
                                            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                {/* Avatar */}
                                                {!isOwnMessage && (
                                                    <Avatar
                                                        size={32}
                                                        icon={<UserOutlined />}
                                                        style={{
                                                            backgroundColor: '#1890ff',
                                                            visibility: showAvatar ? 'visible' : 'hidden'
                                                        }}
                                                    >
                                                        {message.senderUsername?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                )}

                                                {/* Message Bubble */}
                                                <div className={`relative px-4 py-2 rounded-2xl ${
                                                    isOwnMessage
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white border shadow-sm'
                                                }`}>
                                                    {/* Sender Name (only for others' messages) */}
                                                    {!isOwnMessage && showAvatar && (
                                                        <Text
                                                            className={`text-xs font-medium block mb-1 ${
                                                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                                            }`}
                                                        >
                                                            {message.senderUsername}
                                                        </Text>
                                                    )}

                                                    {/* Message Content */}
                                                    <div className={`${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                                                        {message.content}
                                                    </div>

                                                    {/* Timestamp */}
                                                    <Text
                                                        className={`text-xs block mt-1 ${
                                                            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {formatMessageTime(message.timestamp)}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message Input */}
                    <Card className="rounded-none border-t shadow-sm">
                        <div className="flex items-end space-x-3">
                            <div className="flex-1">
                                <TextArea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Mesajınızı yazın... (Enter ile gönder)"
                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                    disabled={!isConnected}
                                />
                            </div>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={sendMessage}
                                disabled={!messageContent.trim() || !isConnected}
                                size="large"
                                className="flex items-center justify-center"
                            >
                                Gönder
                            </Button>
                        </div>

                        {!isConnected && (
                            <Alert
                                message="Bağlantı Kesildi"
                                description="Mesaj gönderebilmek için bağlantınızı kontrol edin."
                                type="warning"
                                showIcon
                                className="mt-3"
                            />
                        )}
                    </Card>
                </div>

                {/* Sidebar - Online Users */}
                <Card className="w-64 rounded-none border-l hidden lg:block">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <TeamOutlined className="text-blue-500" />
                            <Title level={5} className="mb-0">
                                Online Kullanıcılar ({users.length})
                            </Title>
                        </div>

                        <Divider className="my-3" />

                        <div className="space-y-2">
                            {users.length === 0 ? (
                                <Text type="secondary" className="text-center block">
                                    Henüz kimse online değil
                                </Text>
                            ) : (
                                users.map((user, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                        <Badge dot color="green">
                                            <Avatar
                                                size={32}
                                                icon={<UserOutlined />}
                                                style={{ backgroundColor: '#52c41a' }}
                                            >
                                                {user.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Badge>
                                        <div className="flex-1">
                                            <Text strong className="block">
                                                {user}
                                            </Text>
                                            <Text type="secondary" className="text-xs">
                                                {user === currentUser?.name ? 'Siz' : 'Online'}
                                            </Text>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {projectInfo && (
                            <>
                                <Divider />
                                <div className="space-y-2">
                                    <Title level={5} className="mb-2">Proje Bilgileri</Title>
                                    <div className="space-y-1">
                                        <Text type="secondary" className="text-xs block">Proje Adı</Text>
                                        <Text className="block">{projectInfo.title}</Text>
                                    </div>
                                    <div className="space-y-1">
                                        <Text type="secondary" className="text-xs block">Bütçe</Text>
                                        <Text className="block font-medium text-green-600">
                                            {projectInfo.budget}₺
                                        </Text>
                                    </div>
                                    <div className="space-y-1">
                                        <Text type="secondary" className="text-xs block">Durum</Text>
                                        <Tag color={projectInfo.paymentStatus === 'completed' ? 'success' : 'processing'}>
                                            {projectInfo.paymentStatus === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                                        </Tag>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ChatPage;