import { useState } from "react";
import {
  Card,
  List,
  Button,
  Upload,
  Popconfirm,
  Avatar,
  Badge,
  Space,
  message
} from "antd";
import {
  FolderOpenOutlined,
  FileTextOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined
} from "@ant-design/icons";

import { Typography } from "antd";
const { Paragraph } = Typography;

export default function PortfolioCard({ user, onProfileUpdate }) {
  const [uploadLoading, setUploadLoading] = useState(false);

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

  const deletePortfolioFile = async (fileName) => {
    try {
      const res = await fetch(`http://localhost:8080/api/upload/portfolio/${fileName}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        message.success("Portfolyo dosyası başarıyla silindi!");
        onProfileUpdate(); // Parent'a bildir
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Dosya silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
    }
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

  return (
    <Card
      data-portfolio-card
      title={
        <Space>
          <FolderOpenOutlined />
          Portfolyo Dosyaları
          <Badge count={user.portfolio?.length || 0} />
        </Space>
      }
      className="shadow-lg"
      extra={
        <Upload {...uploadProps}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            loading={uploadLoading}
          >
            Yeni Dosya
          </Button>
        </Upload>
      }
    >
      {user.portfolio && user.portfolio.length > 0 ? (
        <List
          dataSource={user.portfolio}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="link"
                  href={`http://localhost:8080${item.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  icon={<FileTextOutlined />}
                >
                  Görüntüle
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Dosyayı silmek istediğinizden emin misiniz?"
                  onConfirm={() => deletePortfolioFile(item.fileName)}
                  okText="Evet"
                  cancelText="Hayır"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Sil
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={item.fileName}
                description={`Yüklenme tarihi: ${new Date(item.uploadedAt).toLocaleDateString('tr-TR')}`}
              />
            </List.Item>
          )}
        />
      ) : (
        <div className="text-center py-8">
          <FolderOpenOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Paragraph type="secondary" className="mt-4">
            Henüz portfolyo dosyanız bulunmamaktadır.
          </Paragraph>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              İlk Dosyanızı Yükleyin
            </Button>
          </Upload>
        </div>
      )}
    </Card>
  );
}
