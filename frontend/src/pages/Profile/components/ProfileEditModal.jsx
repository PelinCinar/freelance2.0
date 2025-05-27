import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  message
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined
} from "@ant-design/icons";

export default function ProfileEditModal({
  visible,
  onCancel,
  user,
  onProfileUpdate
}) {
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const updateProfile = async (values) => {
    setUpdateLoading(true);
    try {
      // Boş şifre alanını temizle
      const updateData = { ...values };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      console.log("Profil güncelleme verisi:", updateData);

      const res = await fetch("http://localhost:8080/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const data = await res.json();
        message.success("Profil başarıyla güncellendi!");
        onProfileUpdate(data.user); // Parent'a yeni user data'sını gönder
        onCancel(); // Modal'ı kapat
        form.resetFields();
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Profil güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    form.resetFields();
  };

  // Modal açıldığında form'u doldur
  const handleModalOpen = () => {
    if (visible && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  };

  // visible prop değiştiğinde form'u güncelle
  React.useEffect(() => {
    handleModalOpen();
  }, [visible, user]);

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Profili Düzenle
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updateProfile}
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
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Yeni Şifre (İsteğe bağlı)"
          rules={[
            { min: 6, message: "Şifre en az 6 karakter olmalıdır!" }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Yeni şifrenizi girin (boş bırakabilirsiniz)"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateLoading}
            >
              Güncelle
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
