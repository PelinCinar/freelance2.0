import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  message,
  Typography,
  Divider,
  List,
  Tag,
  Rate,
  Row,
  Col,
  Statistic,
  Space,
  Avatar,
  Timeline,
  Descriptions,
  Badge,
  Tooltip,
  Progress,
  Spin,
  Empty,
  Alert,
  Modal,
  Form,
  Input
} from "antd";
import {
  FileOutlined,
  CalendarOutlined,
  MessageOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StarOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  PayCircleOutlined,
  ProjectOutlined,
  ExclamationCircleOutlined,
  TagsOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CardDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Review state'leri
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm] = Form.useForm();
  const [reviewLoading, setReviewLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [freelancerReviews, setFreelancerReviews] = useState([]);

  const getStatusColor = (project) => {
    if (project.paymentStatus === 'completed') return 'success';
    if (project.isApproved) return 'processing';
    return 'warning';
  };

  const getStatusText = (project) => {
    if (project.paymentStatus === 'completed') return 'Tamamlandı';
    if (project.isApproved) return 'Onaylandı';
    return 'Beklemede';
  };

  const getStatusIcon = (project) => {
    if (project.paymentStatus === 'completed') return <CheckCircleOutlined />;
    if (project.isApproved) return <PayCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setProject(data.data);
        } else {
          message.error("Proje detayları alınamadı.");
        }
      } catch (error) {
        console.error("Proje detayı alınırken hata oluştu:", error);
        message.error("Proje detayları alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const startChat = () => {
    if (project.acceptedBid) {
      navigate(`/chat/${project._id}`);
    } else {
      message.error("Kabul edilen teklif bulunamadı.");
    }
  };

  const handleGoBack = () => {
    navigate('/employer-panel/projects');
  };

  // Review fonksiyonları
  const checkExistingReview = async () => {
    if (!project?.acceptedBid?.freelancer) return;

    try {
      // Freelancer ID'sini doğru şekilde al
      const freelancerId = project.acceptedBid.freelancer._id || project.acceptedBid.freelancer;

      const res = await fetch(`http://localhost:8080/api/freelancers/${freelancerId}/reviews`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        const myReview = data.data.find(review =>
          review.project.toString() === project._id.toString()
        );
        setExistingReview(myReview);
        setFreelancerReviews(data.data);
      }
    } catch (error) {
      console.error('Review kontrol hatası:', error);
    }
  };

  const handleCreateReview = async (values) => {
    // Duplicate review kontrolü
    if (existingReview) {
      message.warning('Bu proje için zaten değerlendirme yapmışsınız. Birden fazla değerlendirme yapamazsınız.');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: values.rating,
          comment: values.comment
        })
      });

      if (res.ok) {
        message.success('🎉 Değerlendirme başarıyla gönderildi!');
        setShowReviewModal(false);
        reviewForm.resetFields();
        checkExistingReview(); // Yeniden kontrol et
      } else {
        const errorData = await res.json();
        if (errorData.message.includes('zaten değerlendirme')) {
          message.warning('Bu proje için zaten değerlendirme yapmışsınız.');
        } else {
          message.error(errorData.message || 'Değerlendirme gönderilemedi.');
        }
      }
    } catch (error) {
      console.error('Review oluşturma hatası:', error);
      message.error('Sunucuya ulaşılamadı.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Proje yüklendiğinde review kontrolü yap
  useEffect(() => {
    if (project && project.paymentStatus === 'completed' && project.acceptedBid) {
      checkExistingReview();
    }
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Proje detayları yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <Title level={4}>Proje bulunamadı</Title>
          <Text type="secondary">Aradığınız proje mevcut değil veya erişim yetkiniz bulunmuyor.</Text>
          <div className="mt-4">
            <Button type="primary" onClick={handleGoBack}>
              Projelerime Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Başlık ve Geri Dön Butonu */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          size="large"
        >
          Projelerime Dön
        </Button>
        <Space>
          <Tag
            color={getStatusColor(project)}
            icon={getStatusIcon(project)}
            className="px-3 py-1 text-sm"
          >
            {getStatusText(project)}
          </Tag>
        </Space>
      </div>

      {/* Proje Başlığı ve Açıklama */}
      <Card className="shadow-lg">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Title level={2} className="mb-2">{project.title}</Title>
              <Text type="secondary" className="text-lg">
                {project.description}
              </Text>
            </div>
            <Avatar
              size={64}
              icon={<ProjectOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
          </div>
        </div>
      </Card>

      {/* İstatistikler */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Proje Bütçesi"
              value={project.budget}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Teklif Sayısı"
              value={project.bids.length}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Gönderilen Dosya"
              value={project.projectSubmissions?.length || 0}
              prefix={<FileOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Ortalama Puan"
              value={project.rating?.average || 0}
              precision={1}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              suffix="/ 5"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Sol Taraf - Proje Detayları */}
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            {/* Proje Bilgileri */}
            <Card
              title={
                <Space>
                  <ProjectOutlined />
                  <span>Proje Bilgileri</span>
                </Space>
              }
              className="shadow-lg"
            >
              <Descriptions column={1} bordered>
                {/* Kategori */}
                {project.category && (
                  <Descriptions.Item
                    label={<><TagsOutlined className="mr-2" />Kategori</>}
                  >
                    <Tag
                      color={
                        project.category === 'web' ? 'blue' :
                        project.category === 'mobile' ? 'green' :
                        project.category === 'design' ? 'purple' : 'orange'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {project.category === 'web' ? '🌐 Web Geliştirme' :
                       project.category === 'mobile' ? '📱 Mobil Uygulama' :
                       project.category === 'design' ? '🎨 Tasarım' : '🔧 Diğer'}
                    </Tag>
                  </Descriptions.Item>
                )}

                {/* Etiketler */}
                {project.tags && project.tags.length > 0 && (
                  <Descriptions.Item
                    label={<><TagsOutlined className="mr-2" />Etiketler</>}
                  >
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Tag key={index} color="default" className="mb-1">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </Descriptions.Item>
                )}

                {/* Teslim Tarihi */}
                {project.deadline && (
                  <Descriptions.Item
                    label={<><CalendarOutlined className="mr-2" />Teslim Tarihi</>}
                  >
                    <Text className={new Date(project.deadline) < new Date() ? 'text-red-500' : 'text-green-600'}>
                      {new Date(project.deadline).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {new Date(project.deadline) < new Date() && (
                        <Tag color="red" className="ml-2">Geçti</Tag>
                      )}
                    </Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label={<><CalendarOutlined className="mr-2" />Oluşturulma Tarihi</>}
                >
                  {new Date(project.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<><UserOutlined className="mr-2" />Kabul Edilen Freelancer</>}
                >
                  {project.acceptedBid ? (
                    <Space direction="vertical" size="small" className="w-full">
                      <Space>
                        <Avatar
                          src={project.acceptedBid.freelancer?.profileImage?.fileName ?
                            `http://localhost:8080/api/upload/image/${project.acceptedBid.freelancer.profileImage.fileName}` : null}
                          icon={<UserOutlined />}
                          size="small"
                        />
                        <Text strong>{project.acceptedBid.freelancer?.name || 'Bilinmiyor'}</Text>
                        <Tag color="success" size="small">
                          <CheckCircleOutlined className="mr-1" />
                          Seçildi
                        </Tag>
                      </Space>

                      {/* Freelancer Rating */}
                      <div className="flex items-center">
                        <StarOutlined className="mr-1 text-yellow-500" />
                        <Rate
                          disabled
                          value={project.acceptedBid.freelancer?.rating?.average || 0}
                          allowHalf
                          className="text-sm"
                        />
                        <Text type="secondary" className="ml-2 text-xs">
                          {project.acceptedBid.freelancer?.rating?.average ?
                            `${project.acceptedBid.freelancer.rating.average.toFixed(1)} (${project.acceptedBid.freelancer.rating.count} değerlendirme)` :
                            'Henüz değerlendirme yok'
                          }
                        </Text>
                      </div>
                    </Space>
                  ) : (
                    <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                      Henüz Teklif Kabul Edilmedi
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<><DollarOutlined className="mr-2" />Ödeme Durumu</>}
                >
                  {project.paymentStatus === 'completed' ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Ödeme Tamamlandı
                    </Tag>
                  ) : (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                      Ödeme Bekleniyor
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Gönderilen Dosyalar */}
            <Card
              title={
                <Space>
                  <FileOutlined />
                  <span>Gönderilen Dosyalar</span>
                  <Badge count={project.projectSubmissions?.length || 0} />
                </Space>
              }
              className="shadow-lg"
            >
              {project.projectSubmissions && project.projectSubmissions.length > 0 ? (
                <List
                  dataSource={project.projectSubmissions}
                  renderItem={(file) => (
                    <List.Item
                      className="hover:bg-gray-50 transition-colors rounded-lg p-3"
                      actions={[
                        <Tooltip title="Dosyayı indir">
                          <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            href={`http://localhost:8080${file.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            İndir
                          </Button>
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<FileOutlined />}
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        }
                        title={file.fileName}
                        description={
                          <Space>
                            <CalendarOutlined />
                            <Text type="secondary">
                              {new Date(file.uploadedAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Henüz dosya gönderilmemiş"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </div>
        </Col>

        {/* Sağ Taraf - Eylemler ve Timeline */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            {/* Hızlı Eylemler */}
            <Card
              title="Hızlı Eylemler"
              className="shadow-lg"
            >
              <Space direction="vertical" className="w-full" size="middle">
                {project.acceptedBid ? (
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={startChat}
                  >
                    Freelancer ile Sohbet Et
                  </Button>
                ) : (
                  <Tooltip title="Önce bir teklif kabul etmelisiniz">
                    <Button
                      type="default"
                      block
                      size="large"
                      icon={<MessageOutlined />}
                      disabled
                    >
                      Sohbet Et
                    </Button>
                  </Tooltip>
                )}

                <Button
                  type="default"
                  block
                  size="large"
                  icon={<TeamOutlined />}
                  onClick={() => navigate(`/employer-panel/projects/${project._id}/bids`)}
                >
                  Teklifleri Görüntüle ({project.bids.length})
                </Button>

                {/* Review Butonu - Sadece ödeme tamamlandıysa göster */}
                {project.paymentStatus === 'completed' && project.acceptedBid && (
                  existingReview ? (
                    <Tooltip title="Bu freelancer'ı zaten değerlendirdiniz">
                      <Button
                        type="default"
                        block
                        size="large"
                        icon={<StarOutlined />}
                        disabled
                      >
                        Değerlendirme Yapıldı ⭐{existingReview.rating}
                      </Button>
                    </Tooltip>
                  ) : (
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<StarOutlined />}
                      onClick={() => setShowReviewModal(true)}
                      style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                    >
                      Freelancer'ı Değerlendir
                    </Button>
                  )
                )}

                <Button
                  type="default"
                  block
                  size="large"
                  icon={<ProjectOutlined />}
                  onClick={handleGoBack}
                >
                  Tüm Projelerim
                </Button>
              </Space>
            </Card>

            {/* Proje Timeline */}
            <Card
              title="Proje Geçmişi"
              className="shadow-lg"
            >
              <Timeline
                items={[
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong>Proje Oluşturuldu</Text>
                        <br />
                        <Text type="secondary">
                          {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </div>
                    ),
                  },
                  ...(project.bids.length > 0 ? [{
                    color: 'green',
                    children: (
                      <div>
                        <Text strong>İlk Teklif Alındı</Text>
                        <br />
                        <Text type="secondary">
                          {project.bids.length} teklif mevcut
                        </Text>
                      </div>
                    ),
                  }] : []),
                  ...(project.acceptedBid ? [{
                    color: 'purple',
                    children: (
                      <div>
                        <Text strong>Teklif Kabul Edildi</Text>
                        <br />
                        <Text type="secondary">
                          Freelancer ile çalışma başladı
                        </Text>
                      </div>
                    ),
                  }] : []),
                  ...(project.paymentStatus === 'completed' ? [{
                    color: 'gold',
                    children: (
                      <div>
                        <Text strong>Proje Tamamlandı</Text>
                        <br />
                        <Text type="secondary">
                          Ödeme yapıldı
                        </Text>
                      </div>
                    ),
                  }] : []),
                ]}
              />
            </Card>

            {/* Uyarılar */}
            {!project.acceptedBid && (
              <Alert
                message="Henüz Teklif Kabul Edilmedi"
                description="Projeniz için gelen teklifleri inceleyip uygun olanı kabul edebilirsiniz."
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}

            {project.acceptedBid && project.paymentStatus !== 'completed' && (
              <Alert
                message="Ödeme Bekleniyor"
                description="Proje tamamlandığında ödeme yapabilirsiniz."
                type="info"
                showIcon
                icon={<PayCircleOutlined />}
              />
            )}
          </div>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <span>Freelancer Değerlendirmesi</span>
          </Space>
        }
        open={showReviewModal}
        onCancel={() => {
          setShowReviewModal(false);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="Değerlendirme Bilgisi"
            description="Bu değerlendirme freelancer'ın profilinde görünecek ve gelecekteki müşterilerine referans olacaktır."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleCreateReview}
          >
            <Form.Item
              name="rating"
              label="Puan (1-5 yıldız)"
              rules={[
                { required: true, message: 'Lütfen bir puan verin!' }
              ]}
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item
              name="comment"
              label="Yorumunuz"
              rules={[
                { required: true, message: 'Lütfen bir yorum yazın!' },
                { min: 10, message: 'Yorum en az 10 karakter olmalıdır!' },
                { max: 500, message: 'Yorum en fazla 500 karakter olabilir!' }
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Freelancer ile çalışma deneyiminizi paylaşın..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setShowReviewModal(false);
                  reviewForm.resetFields();
                }}
              >
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={reviewLoading}
                icon={<StarOutlined />}
              >
                Değerlendirmeyi Gönder
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default CardDetail;