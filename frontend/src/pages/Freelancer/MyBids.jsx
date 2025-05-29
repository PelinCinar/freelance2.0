import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Avatar,
  Button,
  Spin,
  Empty,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Statistic,
  Badge,
  Tooltip
} from "antd";
import {
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MyBids = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [editForm] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  // Teklifleri getir
  const fetchMyBids = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bids/my-bids", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBids(data.data);

        // İstatistikleri hesapla
        const bidStats = {
          total: data.data.length,
          pending: data.data.filter(bid => bid.status === "pending").length,
          accepted: data.data.filter(bid => bid.status === "accepted").length,
          rejected: data.data.filter(bid => bid.status === "rejected").length,
          totalAmount: data.data.reduce((sum, bid) => sum + (bid.amount || 0), 0)
        };
        setStats(bidStats);
      }
    } catch (error) {
      console.error("Teklifler alınamadı:", error);
      message.error("Teklifler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  // Teklif düzenle
  const handleEditBid = (bid) => {
    if (bid.status !== "pending") {
      message.warning("Sadece bekleyen teklifler düzenlenebilir.");
      return;
    }
    setSelectedBid(bid);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      amount: bid.amount,
      message: bid.message
    });
  };

  // Teklif güncelle
  const handleUpdateBid = async (values) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${selectedBid._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success) {
        message.success("Teklif başarıyla güncellendi!");
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedBid(null);
        fetchMyBids(); // Listeyi yenile
      } else {
        message.error(data.message || "Teklif güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Teklif güncelleme hatası:", error);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setUpdating(false);
    }
  };

  // Durum rengi
  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      accepted: "green",
      rejected: "red"
    };
    return colors[status] || "default";
  };

  // Durum ikonu
  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      accepted: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  // Durum metni
  const getStatusText = (status) => {
    const texts = {
      pending: "Bekliyor",
      accepted: "Kabul Edildi",
      rejected: "Reddedildi"
    };
    return texts[status] || "Bilinmiyor";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Teklifleriniz yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-2">
            <SendOutlined className="mr-2" />
            Toplam Tekliflerim
          </Title>
          <Text type="secondary" className="text-lg">
            Verdiğiniz tüm teklifleri görüntüleyin ve yönetin
          </Text>
        </div>

        {/* İstatistikler */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Toplam Teklif"
                value={stats.total}
                prefix={<SendOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Bekleyen"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Kabul Edilen"
                value={stats.accepted}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Toplam Tutar"
                value={stats.totalAmount}
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                suffix="₺"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Teklif Listesi */}
        <Card
          title={
            <Space>
              <SendOutlined />
              <span>Teklif Listesi</span>
              <Badge count={bids.length} style={{ backgroundColor: '#1890ff' }} />
            </Space>
          }
          className="shadow-lg"
        >
          {bids.length === 0 ? (
            <Empty
              description="Henüz hiç teklif vermediniz."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {bids.map((bid) => (
                <Col xs={24} lg={12} xl={8} key={bid._id}>
                  <Card
                    className="h-full hover:shadow-lg transition-all duration-300 border-l-4"
                    style={{
                      borderLeftColor:
                        bid.status === 'accepted' ? '#52c41a' :
                        bid.status === 'pending' ? '#faad14' : '#ff4d4f'
                    }}
                    actions={[
                      <Tooltip title="Proje Detayı">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/freelancer-panel/project/${bid.project?._id}`)}
                        />
                      </Tooltip>,
                      bid.status === 'pending' && (
                        <Tooltip title="Teklifi Düzenle">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditBid(bid)}
                          />
                        </Tooltip>
                      )
                    ].filter(Boolean)}
                  >
                    <Space direction="vertical" size="middle" className="w-full">
                      {/* Proje Başlığı */}
                      <div>
                        <Text strong className="text-lg block mb-2">
                          {bid.project?.title || 'Proje Bilgisi Yok'}
                        </Text>
                        <Tag color={getStatusColor(bid.status)} icon={getStatusIcon(bid.status)}>
                          {getStatusText(bid.status)}
                        </Tag>
                      </div>

                      {/* Teklif Tutarı */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Space>
                          <DollarOutlined style={{ color: '#1890ff' }} />
                          <Text strong className="text-xl">
                            ₺{bid.amount?.toLocaleString()}
                          </Text>
                        </Space>
                      </div>

                      {/* Teklif Mesajı */}
                      <div>
                        <Text type="secondary" className="text-sm block mb-1">
                          <MessageOutlined className="mr-1" />
                          Teklif Mesajı:
                        </Text>
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: true }}
                          className="text-sm"
                        >
                          {bid.message}
                        </Paragraph>
                      </div>

                      {/* Tarih */}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <Space>
                          <CalendarOutlined />
                          <span>
                            {new Date(bid.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </Space>
                        {bid.project?.budget && (
                          <Text type="secondary">
                            Bütçe: ₺{bid.project.budget.toLocaleString()}
                          </Text>
                        )}
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        {/* Düzenleme Modal'ı */}
        <Modal
          title={
            <Space>
              <EditOutlined style={{ color: '#1890ff' }} />
              <span>Teklifi Düzenle</span>
            </Space>
          }
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
            setSelectedBid(null);
          }}
          footer={null}
          width={600}
        >
          {selectedBid && (
            <div className="space-y-4">
              {/* Proje Bilgisi */}
              <Card size="small" className="bg-gray-50">
                <Text strong>{selectedBid.project?.title}</Text>
              </Card>

              {/* Düzenleme Formu */}
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleUpdateBid}
              >
                <Form.Item
                  name="amount"
                  label="Teklif Tutarı (₺)"
                  rules={[
                    { required: true, message: 'Lütfen teklif tutarınızı girin!' },
                    { type: 'number', min: 1, message: 'Teklif tutarı 1₺ den az olamaz!' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₺\s?|(,*)/g, '')}
                    min={1}
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Teklif Mesajı"
                  rules={[
                    { required: true, message: 'Lütfen teklif mesajınızı yazın!' },
                    { min: 20, message: 'Mesaj en az 20 karakter olmalıdır!' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => {
                      setEditModalVisible(false);
                      editForm.resetFields();
                      setSelectedBid(null);
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    icon={<EditOutlined />}
                  >
                    Güncelle
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyBids;
