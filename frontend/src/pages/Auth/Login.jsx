import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Checkbox, Form, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-type": "application/json; charset=UTF-8" },
        credentials: "include", // Cookie'yi gönder ve al
      });

    
    if (res.status === 200) {
      const data = await res.json();
      message.success("Giriş işlemi başarılı.");

      // Kullanıcının rolüne göre yönlendirme yap
      if (data.user && data.user.role === "admin") {
        navigate("/admin-panel"); // Admin panelinin yolu
      } else {
        navigate("/"); // Diğer kullanıcılar için anasayfa
      }
    } else if (res.status === 404) {
      message.error("Kullanıcı bulunamadı!");
    } else if (res.status === 403) {
      message.error("Şifre yanlış!");
    } else {
      message.error("Bir hata oluştu.");
    }


      setLoading(false);
    } catch (error) {
      console.log(error);
      message.error("Sunucu hatası.");
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Title level={2}>Giriş Yap</Title>
          <Text type="secondary">Hesabınıza giriş yaparak devam edin</Text>
        </div>
        <Card>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "E-posta adresinizi girin!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="E-posta"
                type="email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Şifrenizi girin!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Şifre"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Beni Hatırla</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <div className="text-center text-sm">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="underline hover:text-primary">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
