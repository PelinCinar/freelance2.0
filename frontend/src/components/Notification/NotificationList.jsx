import React, {  useState } from "react";
import { Link } from "react-router-dom";
import { List, Avatar, Button, Typography } from "antd";
import { MessageOutlined, CheckCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

//dayjs: Tarih formatlaması ve kaç dakika önce gönderilmiş gibi ifadeler için kullandık.
dayjs.locale("tr");//türkçe tarih yazsın diye.
dayjs.extend(relativeTime);//2 dakika önce falan filan şeklinde yazsın dye

const { Text } = Typography;

const NotificationList = ({ notifications, markAsRead }) => {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleMarkAsReadInternal = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        const updatedNotifications = localNotifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        );//localnot. içeriindeki her bildirimi n tek tek kontrol edior ve bildirimin idsi okundu olarak işaretlemek istenirse istenen id ile aynıysa isread true olur.
        //Eğer dolaştığın bildirimin ID’si, okundu yapmak istediğin ID’ye eşitsecart curt eğer işlemiyorsa olduğu gibi birak knk
        setLocalNotifications(updatedNotifications);//react UI state güncelleme cart curtu
        markAsRead(id); //sayacı güncelle
      } else {
        console.error("Bildirim okundu olarak işaretlenemedi");
      }
    } catch (err) {
      console.error("Bildirim okundu olarak işaretlenemedi", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setLocalNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Bildirim silinemedi", err);
    }
  };

  return (
    <div className="absolute right-0 top-12 bg-white border w-96 max-h-[500px] overflow-y-auto shadow-md rounded-lg p-4 z-50">
      <List
        itemLayout="horizontal"
        dataSource={localNotifications}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor: !item.isRead ? "#f0f2f5" : "white",
              transition: "background-color 0.3s ease-in-out",
              padding: "16px 0",
            }}
          >
            <List.Item.Meta
              avatar={
                item.type === "message" ? (
                  <Avatar
                    icon={<MessageOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                ) : item.type === "offer" ? (
                  <Avatar
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                ) : (
                  <Avatar>{item.senderUsername.charAt(0).toUpperCase()}</Avatar>
                )
              }
              title={
                <div className="flex justify-between items-start">
                  <div>
                    <Text strong>{item.senderUsername}</Text>
                    <Text type="secondary" className="text-xs block">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </div>
                  {(item.type === "message" || item.type === "offer") && item.roomId && (
                    <Link
                      to={item.type === "offer" ? `/chat/${item.roomId}` : `/chat/${item.roomId}`}
                      onClick={() => handleMarkAsReadInternal(item._id)}
                      className="text-blue-500 hover:underline text-sm ml-2"
                      style={{ alignSelf: "center" }}
                    >
                      {item.type === "offer" ? "Projeye Git" : "Sohbete Git"}
                    </Link>
                  )}
                </div>
              }
              description={<Text>{item.message}</Text>}
            />
            <div className="flex flex-col items-end">
              <Button
                key="read"
                size="small"
                onClick={() => handleMarkAsReadInternal(item._id)}
                disabled={item.isRead}
                style={{ padding: "0 6px" }}
              >
                Okundu
              </Button>
              <Button
                key="delete"
                size="small"
                danger
                onClick={() => handleDelete(item._id)}
                style={{ padding: "0 6px", marginTop: "4px" }}
              >
                Sil
              </Button>
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: <p className="text-center text-gray-500">Bildirim yok</p>,
        }}
        split={false}
      />
    </div>
  );
};

export default NotificationList;