import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined } from '@ant-design/icons';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();// sorgu parametrelerine erişmek için kullanıyoruz şu şekilde /payment/success?session_id=abcdef12345 useparams daha çok rotadaki yerlere yönlendirme için kullanılı /users/:id şeklinde 
  const sessionId = searchParams.get('session_id');//urldeki sessionid parametresini aldık burada ve 
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const checkStatus = async (retryCount = 0) => {
      try {
        const res = await fetch(`http://localhost:8080/api/payments/status?session_id=${sessionId}`, {
          credentials: 'include'
        });

        const data = await res.json();

        if (data.status === 'completed') {
          setPaymentStatus('completed');
        } else if (retryCount < 5) {
          setTimeout(() => checkStatus(retryCount + 1), 2000);
        } else {
          setPaymentStatus('pending');
        }
      } catch (error) {
        console.error(error);
        if (retryCount < 3) {
          setTimeout(() => checkStatus(retryCount + 1), 2000);
        } else {
          setPaymentStatus('error');
        }
      } finally {
        if (retryCount === 0) setLoading(false);
      }
    };

    checkStatus();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Spin size="large" tip="Ödeme durumu kontrol ediliyor..." />
      </div>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <Result
        status="success"
        title="Ödeme Başarılı!"
        subTitle="Ödemeniz başarıyla gerçekleşti. Teşekkürler!"
        extra={[
          <Button type="primary" key="projects" onClick={() => navigate('/employer-panel/projects')}>
            Projelere Dön
          </Button>,
        ]}
      />
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Result
        status="error"
        title="Ödeme Hatası"
        subTitle="Ödeme durumu alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        extra={[
          <Button key="retry" onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      icon={<ClockCircleOutlined />}
      title="Ödeme Bekliyor"
      subTitle="Ödeme işleminiz henüz tamamlanmadı veya bekleniyor. Lütfen bekleyiniz..."
    />
  );
};

export default PaymentSuccess;