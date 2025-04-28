import { Users, Briefcase, Star, CheckCircle } from "lucide-react";

export const stats = [
  {
    value: "10,000+",
    label: "Aktif Freelancer",
    icon: Users, // ✅ JSX değil, component referansı
  },
  {
    value: "2,000+",
    label: "Tamamlanan Proje",
    icon: Briefcase,
  },
  {
    value: "4.9/5",
    label: "Ortalama Puan",
    icon: Star,
  },
  {
    value: "500+",
    label: "Onaylı Uzman",
    icon: CheckCircle,
  },
];
