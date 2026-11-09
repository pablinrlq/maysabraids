# Maysa Braids · Trancista

Site responsivo com portfólio, tabela de valores, **agendamento online com dias e horários livres**, encaminhamento para WhatsApp e painel administrativo. Baseado no projeto da Geovanna Alves (nail designer), adaptado para a [@maysabraids._](https://www.instagram.com/maysabraids._/).

## Como funciona a agenda

- Em `/admin`, a Maysa abre os **dias e horários em que atende**:
  - clica num dia do calendário e adiciona horários (atalhos de 07:00 a 19:00 ou um horário personalizado);
  - "Fechar dia" remove os horários ainda livres daquele dia;
  - "Abrir vários dias de uma vez" define período, dias da semana e horários de uma só vez (até 180 dias).
- No site (`/agendamento`), a cliente **só consegue escolher dias com horários livres**. Dias sem horários aparecem desabilitados.
- Ao reservar, o horário sai da lista na hora (e nunca é reservado duas vezes, mesmo com dois pedidos simultâneos).
- Horários que já têm cliente **não podem ser removidos** da agenda. Para liberá-los, marque o pedido como **Cancelado** na aba "Agendamentos".
- Horários que já passaram não aparecem para as clientes. O fuso usado é `America/Sao_Paulo`.

## Stack

- Next.js 16 e React 19
- Neon Postgres (agenda e agendamentos)
- Deploy preparado para Vercel
- Painel protegido por senha e cookie assinado

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # edite ADMIN_PASSWORD e ADMIN_SESSION_SECRET
npm run dev
```

Sem `DATABASE_URL`, o modo de desenvolvimento usa um **Postgres local embutido (PGlite)** salvo em `.data/`, já com as tabelas criadas. Nada para configurar.

> No Windows, mantenha o projeto numa pasta de caminho curto (por exemplo `C:\projetos\maysa`). Caminhos muito longos fazem o Next.js falhar ao gerar os arquivos de build.

## Banco de dados (produção)

1. Crie um projeto no [Neon](https://neon.tech).
2. Execute, na ordem, no SQL Editor do Neon:
   - `neon/migrations/001_create_bookings.sql`
   - `neon/migrations/002_create_availability.sql`
3. Copie a connection string para `DATABASE_URL`.

## Variáveis de ambiente

```env
ADMIN_PASSWORD=uma-senha-forte
ADMIN_SESSION_SECRET=um-segredo-longo-e-aleatorio
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5531992712047   # opcional
```

`DATABASE_URL` é exclusivamente de servidor. Nunca use o prefixo `NEXT_PUBLIC_` nela.

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Cadastre as variáveis acima em **Settings → Environment Variables**.
3. Em produção, configure `NEXT_PUBLIC_SITE_URL` com a URL final do site.
4. Faça o deploy. O painel fica em `/admin`.

## Onde editar o conteúdo

| O quê | Arquivo |
| --- | --- |
| Tabela de valores / tranças | `lib/services.ts` |
| WhatsApp, Instagram, cidade | `lib/site.ts` |
| Fotos do portfólio | `public/images/work-XX.jpg` + lista `gallery` em `app/page.tsx` |
| Textos da home e FAQ | `app/page.tsx` |
| Cores e estilos | `app/globals.css` (variáveis no topo) |

## Estrutura

```
app/
  page.tsx                  home (portfólio, valores, sobre, FAQ)
  agendamento/              página de agendamento
  BookingForm.tsx           calendário + horários livres + resumo
  admin/                    painel (login, agenda, agendamentos)
  api/availability          dias com horários livres (público)
  api/bookings              horários do dia (GET) e reserva (POST)
  api/admin/availability    abrir/fechar dias e horários (admin)
  api/admin/bookings        listar e alterar status (admin)
db/                         acesso ao banco (Neon, ou PGlite em dev)
neon/migrations/            SQL das tabelas
lib/                        serviços, site, regras de datas, auth
```
