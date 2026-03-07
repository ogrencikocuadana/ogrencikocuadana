import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});

export const metadata = {
  title: "Öğrenci Koçu Adana | LGS & YKS Koçu | Akademik Performans ve Psikolojik Dayanıklılık",
  description:
    "Adana'nın LGS koçu ve YKS koçu. LGS ve YKS öğrencilerine özel bireysel akademik koçluk, psikolojik dayanıklılık eğitimi, haftalık takip ve deneme analizi. Online ve yüz yüze.",
  metadataBase: new URL("https://ogrencikocuadana.com"),
  alternates: {
    canonical: "https://ogrencikocuadana.com",
  },
  keywords: [
    "öğrenci koçu adana",
    "lgs koçu adana",
    "yks koçu adana",
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
    "adana ders koçu",
    "moxo dikkat testi adana",
    "adana hızlı okuma eğitimi",
    "adana sınav koçluğu",
    "pomodoro tekniği adana",
    "adana dikkat testi",
    "adana hızlı okuma",
    "adana akademik performans koçluğu",
    "adana psikolojik dayanıklılık eğitimi",
    "adana deneme analizi",
    "adana veli raporlama sistemi",
    "online lgs koçu",
    "online yks koçu",
  ],
  openGraph: {
    title: "Öğrenci Koçu Adana | LGS & YKS Koçu",
    description:
      "Adana'nın LGS koçu ve YKS koçu. Bireysel akademik koçluk, psikolojik dayanıklılık eğitimi. Online ve yüz yüze.",
    url: "https://ogrencikocuadana.com",
    siteName: "Öğrenci Koçu Adana",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Öğrenci Koçu Adana — LGS ve YKS Koçu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Öğrenci Koçu Adana | LGS & YKS Koçu",
    description:
      "Adana'nın LGS koçu ve YKS koçu. Bireysel akademik koçluk, psikolojik dayanıklılık eğitimi. Online ve yüz yüze.",
    images: ["/og-image.png"],
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
    <html lang="tr" className={`scroll-smooth ${playfair.variable}`}>
      <body className={`${inter.className} bg-white text-slate-900`}>
        <Navbar />
        <div className="h-20" />
        {children}
      </body>
      <GoogleAnalytics gaId="G-NNBBQFHR54" />
    </html>
  );
}