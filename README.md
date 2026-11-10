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

Sem `DATABASE_URL`, o modo de desenvolvimento usa um **Postgres local embutido (PGlite)** salvo fora do projeto (em `%LOCALAPPDATA%maysa-braidsdev-db` no Windows; troque com `DEV_DB_DIR`), já com as tabelas criadas. Nada para configurar.

> No Windows, mantenha o projeto numa pasta de caminho curto (por exemplo `C:\projetos\maysa`). Caminhos muito longos fazem o Next.js falhar ao gerar os arquivos de build.

## Banco de dados

As tabelas são **criadas automaticamente** na primeira requisição (veja `db/schema.ts`). Não é preciso rodar SQL no Neon: basta o site ter a variável `DATABASE_URL`.

## Variáveis de ambiente

```env
ADMIN_PASSWORD=uma-senha-forte
ADMIN_SESSION_SECRET=um-segredo-longo-e-aleatorio
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require   # a integração Neon da Vercel cria sozinha
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # opcional
NEXT_PUBLIC_WHATSAPP_NUMBER=5531992712047    # opcional
```

`DATABASE_URL` é exclusivamente de servidor. Nunca use o prefixo `NEXT_PUBLIC_` nela.

Para gerar um `ADMIN_SESSION_SECRET` e já copiá-lo para a área de transferência:

```bash
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | clip
```

## Deploy na Vercel

1. Importe este repositório na Vercel (framework detectado: Next.js).
2. Na aba **Storage** do projeto, crie um banco **Neon** e conecte ao projeto. Isso cria a `DATABASE_URL`.
3. Em **Settings → Environment Variables**, cadastre `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` (Production e Preview).
4. Faça um novo deploy (variáveis novas só valem depois de um deploy). O painel fica em `/admin`.

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
db/schema.ts                tabelas (criadas automaticamente)
lib/                        serviços, site, regras de datas, auth
```
