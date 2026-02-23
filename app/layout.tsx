import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Öğrenci Koçu Adana | Akademik Performans ve Psikolojik Dayanıklılık Modeli",
  description:
    "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik performans koçluğu ve psikolojik dayanıklılık eğitimi. Haftalık takip, deneme analizi ve veli raporlama sistemi.",
  metadataBase: new URL("https://ogrencikocuadana.com"),
  alternates: {
    canonical: "https://ogrencikocuadana.com",
  },
  keywords: [
    "öğrenci koçu adana",
    "adana lgs koçu",
    "adana yks koçu",
    "akademik koçluk adana",
    "lgs hazırlık adana",
    "yks hazırlık adana",
    "öğrenci danışmanlık adana",
    "psikolojik dayanıklılık eğitimi",
    "sınav koçu adana",
    "bireysel ders adana",
    "adana öğrenci koçluğu",
    "adana öğrenci koçu",
    "eğitim koçu adana",
    "adana ders koçu"
  ],
  openGraph: {
    title: "Öğrenci Koçu Adana | Akademik Performans ve Psikolojik Dayanıklılık Modeli",
    description:
      "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik performans koçluğu ve psikolojik dayanıklılık eğitimi.",
    url: "https://ogrencikocuadana.com",
    siteName: "Öğrenci Koçu Adana",
    locale: "tr_TR",
    type: "website",
    images: [
  {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Öğrenci Koçu Adana",
  },
],
  },
  twitter: {
    card: "summary_large_image",
    title: "Öğrenci Koçu Adana | Akademik Performans ve Psikolojik Dayanıklılık Modeli",
    description:
      "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik performans koçluğu ve psikolojik dayanıklılık eğitimi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "hcEpeTsta9BYeI_63ruaZco1k3_92EYv9l9yHDMLNVw",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-slate-900`}>
        <Navbar />
        <div className="h-20" />
        {children}
      </body>
      <GoogleAnalytics gaId="G-NNBBQFHR54" />
    </html>
  );
}