import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, message, Button, Avatar, Row, Col, Divider } from "antd";
import { UserOutlined, MailOutlined,  CalendarOutlined, FolderOpenOutlined,FolderOutlined  } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        message.error("Kullanıcı bilgisi alınamadı.");
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return <Spin size="large" className="flex justify-center mt-20" />;
  }

  if (!user) {
    return <Text>Kullanıcı bilgisi bulunamadı.</Text>;
  }

  return (
    <div className="flex justify-center mt-10">
      <Card
        title={
          <div className="flex items-center">
            <Avatar size={64} icon={<UserOutlined />} className="mr-3" />
            <Title level={3} style={{ marginBottom: 0 }}>
              {user.name}
            </Title>
          </div>
        }
        style={{ width: 400 }}
      >
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <p>
              <MailOutlined className="mr-2" />
              <strong>Email:</strong> {user.email}
            </p>
          </Col>
          <Col span={12}>
            <p>
              <FolderOutlined className="mr-2" />
              <strong>Rol:</strong> {user.role === "employer" ? "İşveren" : user.role === "freelancer" ? "Freelancer" : user.role}
            </p>
          </Col>
        </Row>
        <Row gutter={16} className="mt-3">
          <Col span={24}>
            <p>
              <CalendarOutlined className="mr-2" />
              <strong>Kayıt Tarihi:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </Col>
        </Row>

        {user.portfolio && user.portfolio.length > 0 && (
          <>
            <Divider />
            <p>
              <FolderOpenOutlined className="mr-2" />
              <strong>Portfolyo:</strong>
            </p>
            <ul>
              {user.portfolio.map((item) => (
                <li key={item._id}>
                  <a
                    href={`http://localhost:8080${item.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <Divider />
        <div className="mt-6">
          {user.role === "employer" && (
            <Button
              type="primary"
              onClick={() => navigate("/employer-panel/dashboard")}
              block
            >
              İşveren Paneline Git
            </Button>
          )}
          {user.role === "freelancer" && (
            <Button
              type="default"
              style={{ backgroundColor: "#52c41a", color: "white", borderColor: "#52c41a" }}
              onClick={() => navigate("/freelancer-panel/dashboard")}
              block
            >
              Freelancer Paneline Git
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}