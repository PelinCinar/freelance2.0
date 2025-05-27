import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Form, Card, Typography, message, Row, Col, Select } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-type": "application/json; charset=UTF-8" },
        credentials: "include",
      });

      if (res.status === 201) {
        message.success("Kayıt işlemi başarılı. Giriş yapabilirsiniz.");
        navigate("/login");
      } else if (res.status === 400) {
        message.error("Bu e-posta adresi zaten kullanılıyor!");
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', width: '100%' }}>
        <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <div className="space-y-6">
              <div className="text-center">
                <Title level={2} className="mb-2">Kayıt Ol</Title>
                <Text type="secondary" className="text-base">
                  Yeni hesap oluşturun ve başlayın
                </Text>
              </div>

              <Card
                className="shadow-lg border-0"
                styles={{ body: { padding: '32px' } }}
              >
                <Form
                  name="register"
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="name"
                    label="Ad Soyad"
                    rules={[
                      { required: true, message: "Ad soyadınızı girin!" },
                      { min: 2, message: "Ad soyad en az 2 karakter olmalıdır!" }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Ad soyadınızı girin"
                      autoComplete="name"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="E-posta"
                    rules={[
                      { required: true, message: "E-posta adresinizi girin!" },
                      { type: "email", message: "Geçerli bir e-posta adresi girin!" }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="E-posta adresinizi girin"
                      type="email"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Şifre"
                    rules={[
                      { required: true, message: "Şifrenizi girin!" },
                      { min: 6, message: "Şifre en az 6 karakter olmalıdır!" }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Şifrenizi girin"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Şifre Tekrar"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: "Şifrenizi tekrar girin!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Şifrenizi tekrar girin"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="Hesap Türü"
                    rules={[{ required: true, message: "Hesap türünüzü seçin!" }]}
                  >
                    <Select placeholder="Hesap türünüzü seçin">
                      <Option value="freelancer">Freelancer</Option>
                      <Option value="employer">İşveren</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      size="large"
                    >
                      Kayıt Ol
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <div className="text-center">
                <Text className="text-base">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Giriş Yap
                  </Link>
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
