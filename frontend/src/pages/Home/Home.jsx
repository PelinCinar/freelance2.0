import { Link } from "react-router-dom";
import { Button } from "antd";
import { ArrowRight } from "lucide-react";
import { stats } from "../../data/freelance";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Freelance İş Platformu
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Yeteneklerinizi sergileyerek iş alın veya projeniz için en iyi
                  freelancer'ı bulun. Güvenli, hızlı ve kolay.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-[400px]:gap-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Hemen Başla <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/projects" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto" type="default">
                    Projeleri Keşfet
                  </Button>
                </Link>
              </div>
            </div>
            {/* Sağ kısım görsel için ayrıldı ama kullanılmıyor */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-border"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Hemen Kaydolun ve Başlayın
              </h2>
              <p className="max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                İster freelancer olun, ister işveren, platformumuz size en iyi
                deneyimi sunmak için hazır.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/register?role=freelancer">
                <Button
                  size="lg"
                  type="default"
                  className="w-full min-[400px]:w-auto bg-white text-primary"
                >
                  Freelancer Olarak Kaydol
                </Button>
              </Link>
              <Link to="/register?role=employer">
                <Button
                  size="lg"
                  className="w-full min-[400px]:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  İşveren Olarak Kaydol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
