import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Checkbox, Form, Card, Typography, message, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
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
  <>
  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', width: '100%' }}>
        <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <div className="space-y-6">
              <div className="text-center">
                <Title level={2} className="mb-2">Giriş Yap</Title>
                <Text type="secondary" className="text-base">
                  Hesabınıza giriş yaparak devam edin
                </Text>
              </div>

              <Card
                className="shadow-lg border-0"
                styles={{ body: { padding: '32px' } }}
              >
                <Form
                  name="login"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    label="E-posta"
                    rules={[
                      { required: true, message: "E-posta adresinizi girin!" },
                      { type: "email", message: "Geçerli bir e-posta adresi girin!" }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="E-posta adresinizi girin"
                      type="email"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Şifre"
                    rules={[{ required: true, message: "Şifrenizi girin!" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Şifrenizi girin"
                      autoComplete="current-password"
                    />
                  </Form.Item>

                  <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Beni Hatırla</Checkbox>
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      size="large"
                    >
                      Giriş Yap
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <div className="text-center">
                <Text className="text-base">
                  Hesabınız yok mu?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Kayıt Ol
                  </Link>
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div></>
  );
}
