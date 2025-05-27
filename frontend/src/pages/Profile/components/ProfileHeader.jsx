import { useState } from "react";
import {
  Avatar,
  Button,
  Upload,
  Popconfirm,
  Space,
  Tag,
  Divider,
  Descriptions,
  message
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  FolderOutlined,
  EditOutlined,
  CameraOutlined,
  LoadingOutlined,
  DeleteOutlined,
  UploadOutlined
} from "@ant-design/icons";

import { Typography } from "antd";
const { Title, Text } = Typography;

export default function ProfileHeader({
  user,
  onEditProfile,
  onProfileUpdate
}) {
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const uploadProfileImage = async (file) => {
    setProfileImageLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:8080/api/upload/profile-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        message.success("Profil fotoğrafı başarıyla yüklendi!");
        onProfileUpdate(); // Parent'a bildir
        return true;
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Profil fotoğrafı yüklenirken bir hata oluştu.");
        return false;
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
      return false;
    } finally {
      setProfileImageLoading(false);
    }
  };

  const deleteProfileImage = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/upload/profile-image", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        message.success("Profil fotoğrafı başarıyla silindi!");
        onProfileUpdate(); // Parent'a bildir
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Profil fotoğrafı silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
    }
  };

  const uploadPortfolio = async (file) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8080/api/upload/portfolio", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        message.success("Portfolyo dosyası başarıyla yüklendi!");
        onProfileUpdate(); // Parent'a bildir
        return true;
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Dosya yüklenirken bir hata oluştu.");
        return false;
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const profileImageUploadProps = {
    beforeUpload: (file) => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
      if (!isValidType) {
        message.error('Sadece PNG, JPG, JPEG dosyaları yüklenebilir!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Profil fotoğrafı boyutu 5MB\'dan küçük olmalıdır!');
        return false;
      }
      uploadProfileImage(file);
      return false;
    },
    showUploadList: false,
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ].includes(file.type);

      if (!isValidType) {
        message.error('Sadece PDF, DOC, DOCX, PNG, JPG dosyaları yüklenebilir!');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Dosya boyutu 10MB\'dan küçük olmalıdır!');
        return false;
      }

      uploadPortfolio(file);
      return false; // Otomatik upload'u engelle
    },
    showUploadList: false,
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "employer":
        return "blue";
      case "freelancer":
        return "green";
      case "admin":
        return "red";
      default:
        return "default";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "employer":
        return "İşveren";
      case "freelancer":
        return "Freelancer";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <div>
        <div className="relative inline-block">
          <Avatar
            size={120}
            src={user.profileImage?.fileName ? `http://localhost:8080/api/upload/image/${user.profileImage.fileName}` : null}
            icon={!user.profileImage?.fileName ? <UserOutlined /> : null}
            className="mb-4"
            style={{
              backgroundColor: user.profileImage?.fileName ? 'transparent' : (user.role === 'employer' ? '#1890ff' : '#52c41a'),
              border: '4px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <div className="absolute bottom-2 right-2">
            <Upload {...profileImageUploadProps}>
              <Button
                type="primary"
                shape="circle"
                icon={profileImageLoading ? <LoadingOutlined /> : <CameraOutlined />}
                size="small"
                loading={profileImageLoading}
                title="Profil fotoğrafını değiştir"
              />
            </Upload>
          </div>
          {user.profileImage?.fileName && (
            <div className="absolute top-2 right-2">
              <Popconfirm
                title="Profil fotoğrafını silmek istediğinizden emin misiniz?"
                onConfirm={deleteProfileImage}
                okText="Evet"
                cancelText="Hayır"
              >
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="small"
                  title="Profil fotoğrafını sil"
                />
              </Popconfirm>
            </div>
          )}
        </div>
        <Title level={2} className="mb-2">{user.name}</Title>
        <Tag
          color={getRoleColor(user.role)}
          className="mb-4 px-3 py-1 text-sm font-medium"
        >
          <FolderOutlined className="mr-1" />
          {getRoleText(user.role)}
        </Tag>
      </div>

      <Divider />

      <div className="text-left w-full">
        <Descriptions column={1} size="small">
          <Descriptions.Item
            label={<><MailOutlined className="mr-2" />E-posta</>}
          >
            <Text copyable>{user.email}</Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={<><CalendarOutlined className="mr-2" />Kayıt Tarihi</>}
          >
            {new Date(user.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Divider />

      <Space direction="vertical" className="w-full">
        <Button
          type="default"
          icon={<EditOutlined />}
          block
          size="large"
          onClick={onEditProfile}
        >
          Profili Düzenle
        </Button>
        <Upload {...uploadProps}>
          <Button
            type="default"
            icon={<UploadOutlined />}
            block
            size="large"
            loading={uploadLoading}
          >
            Portfolyo Yükle
          </Button>
        </Upload>
      </Space>
    </Space>
  );
}
