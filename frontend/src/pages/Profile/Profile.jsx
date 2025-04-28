import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, message,Button  } from "antd";
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
      <Card title="Profil Bilgileri" style={{ width: 400 }}>
        <p>
          <strong>İsim:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Rol:</strong> {user.role}
        </p>
        <p>
          <strong>Kayıt Tarihi:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </p>

        {user.portfolio && user.portfolio.length > 0 && (
          <>
            <p>
              <strong>Portfolio:</strong>
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
            {/* İşveren paneline yönlendirme butonu */}
            {user.role === "employer" && (
          <div className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate("/employer-panel/dashboard")}
              block
            >
              İşveren Paneline Git
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
