import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  List,
  Rate,
  Button,
  Space,
  Tag,
  Avatar,
  Spin,
  Empty,
  message,
  Modal,
  Form,
  Input,
  Divider,
  Alert
} from 'antd';
import {
  StarOutlined,
  EditOutlined,
  ProjectOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewedProjects = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // Yorumladığım projeleri getir
  const fetchReviewedProjects = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/reviews/my-reviews', {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();

        // Null kontrolü ile filtreleme
        const validReviews = (data.data || []).filter(review => {
          if (!review.project) {
            console.warn('⚠️ Project bilgisi olmayan review:', review);
            return false;
          }
          if (!review.freelancer) {
            console.warn('⚠️ Freelancer bilgisi olmayan review:', review);
            return false;
          }
          if (!review._id) {
            console.warn('⚠️ ID bilgisi olmayan review:', review);
            return false;
          }
          return true;
        });

        setReviews(validReviews);
      } else {
        message.error('Yorumlar yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Reviews fetch error:', error);
      message.error('Sunucuya ulaşılamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewedProjects();
  }, []);

  // Review düzenleme
  const handleEditReview = (review) => {
    setEditingReview(review);
    editForm.setFieldsValue({
      rating: review.rating,
      comment: review.comment
    });
    setEditModalVisible(true);
  };

  // Review güncelleme
  const handleUpdateReview = async (values) => {
    if (!editingReview?._id) {
      message.error('Review ID bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/reviews/${editingReview._id}`, {
        method: 'PUT',
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
        message.success('🎉 Değerlendirme başarıyla güncellendi!');
        setEditModalVisible(false);
        editForm.resetFields();
        setEditingReview(null);
        fetchReviewedProjects(); // Listeyi yenile
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Değerlendirme güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Review update error:', error);
      message.error('Sunucuya ulaşılamadı.');
    } finally {
      setEditLoading(false);
    }
  };

  // Proje detayına git
  const handleViewProject = (projectId) => {
    if (projectId) {
      navigate(`/employer-panel/projects/${projectId}`);
    } else {
      message.error('Proje bilgisi bulunamadı.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/employer-panel/dashboard')}
          className="mb-4"
        >
          Dashboard'a Dön
        </Button>
        <Title level={2} className="mb-2">
          <StarOutlined className="mr-2 text-yellow-500" />
          Yorumladığım Projeler
        </Title>
        <Text type="secondary" className="text-lg">
          Tamamlanan projeleriniz için yaptığınız değerlendirmeleri görüntüleyin ve düzenleyin.
        </Text>
      </div>

      {/* Info Alert */}
      <Alert
        message="💡 Bilgi"
        description="Bu sayfada sadece ödeme tamamlanmış ve değerlendirme yaptığınız projeler görünür. Değerlendirmelerinizi düzenleyebilirsiniz."
        type="info"
        showIcon
        className="mb-6"
      />

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Henüz hiç değerlendirme yapmadınız.</Text>
                <br />
                <Text type="secondary">
                  Tamamlanan projeleriniz için freelancer'ları değerlendirin.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => navigate('/employer-panel/completed-projects')}
            >
              Tamamlanan Projelere Git
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 2,
            xxl: 3,
          }}
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item>
              <Card
                className="shadow-lg hover:shadow-xl transition-shadow"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditReview(review)}
                  >
                    Düzenle
                  </Button>,
                  <Button
                    key="view"
                    type="text"
                    icon={<ProjectOutlined />}
                    onClick={() => handleViewProject(review.project?._id)}
                    disabled={!review.project?._id}
                  >
                    Projeyi Gör
                  </Button>
                ]}
              >
                {/* Proje Bilgileri */}
                <div className="mb-4">
                  <Title level={4} className="mb-2 line-clamp-2">
                    {review.project?.title || 'Proje Bilgisi Bulunamadı'}
                  </Title>

                  <Space direction="vertical" size="small" className="w-full">
                    {/* Freelancer */}
                    <div className="flex items-center">
                      <Avatar
                        size="small"
                        src={review.freelancer?.profileImage?.fileName ?
                          `http://localhost:8080/api/upload/image/${review.freelancer.profileImage.fileName}` : null}
                        icon={<UserOutlined />}
                        className="mr-2"
                      />
                      <Text strong>{review.freelancer?.name || 'Freelancer Bilgisi Yok'}</Text>
                    </div>

                    {/* Proje Kategorisi */}
                    {review.project?.category && (
                      <Tag
                        color={
                          review.project.category === 'web' ? 'blue' :
                          review.project.category === 'mobile' ? 'green' :
                          review.project.category === 'design' ? 'purple' : 'orange'
                        }
                      >
                        {review.project.category === 'web' ? '🌐 Web' :
                         review.project.category === 'mobile' ? '📱 Mobil' :
                         review.project.category === 'design' ? '🎨 Tasarım' : '🔧 Diğer'}
                      </Tag>
                    )}

                    {/* Bütçe */}
                    {review.project?.budget && (
                      <div className="flex items-center">
                        <DollarOutlined className="mr-1 text-green-600" />
                        <Text strong className="text-green-600">
                          ₺{review.project.budget.toLocaleString()}
                        </Text>
                      </div>
                    )}
                  </Space>
                </div>

                <Divider />

                {/* Review Bilgileri */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>Değerlendirmeniz:</Text>
                    <Rate disabled value={review.rating} />
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 3, expandable: true, symbol: 'daha fazla' }}
                    className="text-gray-600 mb-2"
                  >
                    {review.comment}
                  </Paragraph>

                  <div className="flex items-center text-gray-400 text-sm">
                    <CalendarOutlined className="mr-1" />
                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Edit Review Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#faad14' }} />
            <span>Değerlendirmeyi Düzenle</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingReview(null);
        }}
        footer={null}
        width={600}
      >
        {editingReview && (
          <div className="space-y-4">
            <Alert
              message="Değerlendirme Düzenleme"
              description={`"${editingReview.project?.title || 'Proje'}" projesi için yaptığınız değerlendirmeyi düzenliyorsunuz.`}
              type="warning"
              showIcon
              className="mb-4"
            />

            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateReview}
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
                <TextArea
                  rows={4}
                  placeholder="Freelancer ile çalışma deneyiminizi paylaşın..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                    setEditingReview(null);
                  }}
                >
                  İptal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editLoading}
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
  );
};

export default ReviewedProjects;
