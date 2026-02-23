import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Öğrenci Koçu Adana | Akademik Performans ve Psikolojik Dayanıklılık Modeli",
  description:
    "Öğrenci Koçu Adana - Akademik performans artırma ve psikolojik dayanıklılık modeli ile LGS ve YKS öğrencilerine disiplinli performans koçluğu hizmeti.",
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
    </html>
  );
}