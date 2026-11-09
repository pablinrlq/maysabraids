import { clearAdminCookie, createAdminCookie, isAdminRequest, isSameOrigin, passwordIsValid } from "../../../../lib/admin-auth";

export async function GET(request: Request) {
  try {
    return Response.json({ authenticated: await isAdminRequest(request) });
  } catch {
    return Response.json({ authenticated: false });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const { password } = (await request.json()) as { password?: string };
    if (!password || !(await passwordIsValid(password))) {
      return Response.json({ error: "Senha incorreta." }, { status: 401 });
    }
    return Response.json({ authenticated: true }, { headers: { "Set-Cookie": await createAdminCookie() } });
  } catch {
    return Response.json({ error: "Não foi possível entrar." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  return Response.json({ authenticated: false }, { headers: { "Set-Cookie": clearAdminCookie() } });
}
