import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import "./globals.css";
import { Header, Footer } from "@/components/chrome";

export const metadata: Metadata = {
  title: { default: "Conecta Técnico — Educação e oportunidades", template: "%s | Conecta Técnico" },
  description: "Descubra eventos, capacitações e oportunidades para estudantes do Ensino Médio Integrado ao Técnico.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={GeistSans.variable} suppressHydrationWarning><body><a className="skip" href="#conteudo">Pular para o conteúdo</a><Header/><main id="conteudo">{children}</main><Footer/><Toaster position="bottom-right" richColors/></body></html>;
}
