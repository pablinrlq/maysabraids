import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Painel administrativo | Maysa Braids",
  description: "Área restrita para gerenciar agenda e agendamentos.",
  robots: { index: false, follow: false },
  openGraph: { title: "Painel administrativo", description: "Área restrita.", images: [] },
  twitter: { title: "Painel administrativo", description: "Área restrita.", images: [] },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
