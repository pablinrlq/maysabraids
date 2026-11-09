import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "../BookingForm";

export const metadata: Metadata = {
  title: "Agendar horário | Maysa Braids",
  description: "Escolha a trança, veja os dias e horários livres da Maysa e reserve o seu.",
  openGraph: {
    title: "Agendar horário | Maysa Braids",
    description: "Escolha sua trança e veja os horários livres.",
    images: [],
  },
  twitter: {
    title: "Agendar horário | Maysa Braids",
    description: "Escolha sua trança e veja os horários livres.",
    images: [],
  },
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const { servico } = await searchParams;
  return (
    <main className="booking-page">
      <header className="booking-page-header">
        <Link className="brand" href="/" aria-label="Voltar para o início">
          <span>Maysa</span><small>Braids · trancista</small>
        </Link>
        <Link className="back-link" href="/"><span aria-hidden="true">←</span> Voltar ao site</Link>
      </header>
      <section className="booking section">
        <div className="booking-intro">
          <p className="eyebrow">Agendamento</p>
          <h1>Reserve o<br /><em>seu horário.</em></h1>
          <p>Escolha a trança, um dia com horários livres e o melhor horário para você. Ao finalizar, o pedido segue para o WhatsApp da Maysa.</p>
        </div>
        <BookingForm initialServiceId={servico} />
      </section>
    </main>
  );
}
