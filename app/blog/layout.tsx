import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Öğrenci Koçu Adana",
  description:
    "LGS ve YKS hazırlık sürecinde işinize yarayacak yazılar. Zaman yönetimi, sınav kaygısı, verimli ders çalışma ve daha fazlası.",
  alternates: { canonical: "https://ogrencikocuadana.com/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}