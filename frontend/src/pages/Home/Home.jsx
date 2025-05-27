import { Link } from "react-router-dom";
import { Button, Row, Col, Typography } from "antd";
import { ArrowRight } from "lucide-react";
import { stats } from "../../data/freelance";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Row gutter={[24, 24]} align="middle" justify="center">
            <Col xs={24} sm={22} md={20} lg={12}>
              <div>
                <Title level={1} className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl m-0">
                  Freelance İş Platformu
                </Title>
                <Paragraph className="text-muted-foreground md:text-xl mt-4">
                  Yeteneklerinizi sergileyerek iş alın veya projeniz için en iyi
                  freelancer'ı bulun. Güvenli, hızlı ve kolay.
                </Paragraph>
                <Row gutter={[16, 16]} className="mt-6">
                  <Col xs={24} sm={12}>
                    <Link to="/register" className="block">
                      <Button size="large" className="w-full" type="primary">
                        Hemen Başla <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Link to="/projects" className="block">
                      <Button size="large" className="w-full" type="default">
                        Projeleri Keşfet
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              {/* Sağ kısım görsel için ayrıldı ama kullanılmıyor */}
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Row gutter={[24, 24]} justify="center">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-border h-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Title level={3} className="text-3xl font-bold m-0">{stat.value}</Title>
                    <Paragraph className="text-muted-foreground text-center m-0">{stat.label}</Paragraph>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Row justify="center">
            <Col xs={24} sm={22} md={20} lg={16}>
              <div className="text-center">
                <Title level={2} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white m-0">
                  Hemen Kaydolun ve Başlayın
                </Title>
                <Paragraph className="md:text-xl lg:text-base xl:text-xl text-white mt-4">
                  İster freelancer olun, ister işveren, platformumuz size en iyi
                  deneyimi sunmak için hazır.
                </Paragraph>
                <Row gutter={[16, 16]} className="mt-6" justify="center">
                  <Col xs={24} sm={12} md={10} lg={8}>
                    <Link to="/register?role=freelancer" className="block">
                      <Button
                        size="large"
                        type="default"
                        className="w-full bg-white text-primary"
                      >
                        Freelancer Olarak Kaydol
                      </Button>
                    </Link>
                  </Col>
                  <Col xs={24} sm={12} md={10} lg={8}>
                    <Link to="/register?role=employer" className="block">
                      <Button
                        size="large"
                        className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      >
                        İşveren Olarak Kaydol
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
}
