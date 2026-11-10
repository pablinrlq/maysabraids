"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AvailabilityManager from "./AvailabilityManager";
import { UnauthorizedError, adminFetch } from "./api";
import { formatBrPhone } from "../../lib/phone";

type Booking = {
  id: number;
  name: string;
  phone: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string;
  note: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

const statusLabels = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"agenda" | "bookings">("agenda");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | Booking["status"]>("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleUnauthorized = useCallback(() => {
    setAuthenticated(false);
    setBookings([]);
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const data = await adminFetch<{ bookings: Booking[] }>("/api/admin/bookings");
      setBookings(data.bookings);
    } catch (cause) {
      if (cause instanceof UnauthorizedError) return handleUnauthorized();
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os agendamentos.");
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ authenticated: boolean }>)
      .then(async (session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) await loadBookings();
      })
      .catch(() => setError("Não foi possível abrir o painel."))
      .finally(() => setChecking(false));
  }, [loadBookings]);

  const visibleBookings = useMemo(
    () => filter === "all" ? bookings : bookings.filter((booking) => booking.status === filter),
    [bookings, filter],
  );

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível entrar.");
      setAuthenticated(true);
      setPassword("");
      await loadBookings();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    handleUnauthorized();
  }

  async function updateStatus(id: number, status: Booking["status"]) {
    setError("");
    const previous = bookings;
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking));
    try {
      await adminFetch("/api/admin/bookings", { method: "PATCH", body: JSON.stringify({ id, status }) });
    } catch (cause) {
      setBookings(previous);
      if (cause instanceof UnauthorizedError) return handleUnauthorized();
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar este agendamento.");
    }
  }

  if (checking) return <div className="admin-loading">Abrindo painel...</div>;

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        <Link className="admin-logo" href="/">Maysa <span>Braids</span></Link>
        <form className="admin-login-card" onSubmit={login}>
          <p>ÁREA ADMINISTRATIVA</p>
          <h1>Bem-vinda,<br /><em>Maysa.</em></h1>
          <label><span>Senha de acesso</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <div className="admin-error" role="alert">{error}</div>}
          <button type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar no painel"}</button>
          <Link href="/">← Voltar para o site</Link>
        </form>
      </main>
    );
  }

  const pending = bookings.filter((booking) => booking.status === "pending").length;

  return (
    <main className="admin-page">
      <header className="admin-header"><div><span className="admin-logo">Maysa <b>Braids</b></span><small>Painel da trancista</small></div><div><a href="/" target="_blank">Ver site ↗</a><button type="button" onClick={logout}>Sair</button></div></header>
      <section className="admin-content">
        <div className="admin-tabs" role="tablist" aria-label="Seções do painel">
          <button type="button" role="tab" aria-selected={tab === "agenda"} className={tab === "agenda" ? "active" : ""} onClick={() => setTab("agenda")}>Minha agenda</button>
          <button type="button" role="tab" aria-selected={tab === "bookings"} className={tab === "bookings" ? "active" : ""} onClick={() => { setTab("bookings"); void loadBookings(); }}>
            Agendamentos{pending > 0 && <span className="tab-badge">{pending}</span>}
          </button>
        </div>

        {tab === "agenda" && (
          <>
            <div className="admin-title"><div><p>DISPONIBILIDADE</p><h1>Minha agenda</h1></div></div>
            <p className="admin-intro">Abra os dias e horários em que você atende. Só o que estiver aberto aparece para as clientes no site; quando uma cliente reserva, o horário sai da lista automaticamente.</p>
            <AvailabilityManager onUnauthorized={handleUnauthorized} />
          </>
        )}

        {tab === "bookings" && (
          <>
            <div className="admin-title"><div><p>VISÃO GERAL</p><h1>Agendamentos</h1></div><button type="button" onClick={() => loadBookings()}>Atualizar</button></div>
            <div className="admin-metrics">
              <div><span>Pedidos pendentes</span><strong>{pending}</strong></div>
              <div><span>Confirmados</span><strong>{bookings.filter((booking) => booking.status === "confirmed").length}</strong></div>
              <div><span>Total de pedidos</span><strong>{bookings.length}</strong></div>
            </div>
            <div className="admin-toolbar">
              {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
                <button type="button" className={filter === status ? "active" : ""} onClick={() => setFilter(status)} key={status}>
                  {status === "all" ? "Todos" : statusLabels[status]}
                </button>
              ))}
            </div>
            <p className="admin-hint">Ao marcar um pedido como <b>Cancelado</b>, o horário volta a ficar livre para novas clientes.</p>
            {error && <div className="admin-error" role="alert">{error}</div>}
            <div className="booking-table-wrap">
              <table className="booking-table">
                <thead><tr><th>Cliente</th><th>WhatsApp</th><th>Trança</th><th>Data</th><th>Horário</th><th>Observação</th><th>Status</th></tr></thead>
                <tbody>
                  {visibleBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td data-label="Cliente"><strong>{booking.name}</strong><small>Pedido #{booking.id}</small></td>
                      <td data-label="WhatsApp">{booking.phone ? <a className="phone-link" href={`https://wa.me/${booking.phone}`} target="_blank" rel="noreferrer">{formatBrPhone(booking.phone)}</a> : "—"}</td>
                      <td data-label="Trança">{booking.serviceTitle}</td>
                      <td data-label="Data">{new Date(`${booking.date}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                      <td data-label="Horário"><strong>{booking.time}</strong></td>
                      <td data-label="Observação" className="booking-note">{booking.note || "—"}</td>
                      <td data-label="Status"><select aria-label={`Status do agendamento de ${booking.name}`} className={`status-select ${booking.status}`} value={booking.status} onChange={(event) => updateStatus(booking.id, event.target.value as Booking["status"])}><option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleBookings.length === 0 && <div className="empty-bookings">Nenhum agendamento nesta categoria.</div>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
