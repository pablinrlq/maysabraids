const COOKIE_NAME = "maysa_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

type AdminEnv = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

function getSecrets() {
  const runtimeEnv: AdminEnv = {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  };
  if (!runtimeEnv.ADMIN_PASSWORD || !runtimeEnv.ADMIN_SESSION_SECRET) {
    throw new Error("Admin credentials are not configured.");
  }
  return runtimeEnv;
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function safeEqual(first: string, second: string) {
  const [firstHash, secondHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(first)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(second)),
  ]);
  const firstBytes = new Uint8Array(firstHash);
  const secondBytes = new Uint8Array(secondHash);
  let result = 0;
  for (let index = 0; index < firstBytes.length; index += 1) result |= firstBytes[index] ^ secondBytes[index];
  return result === 0;
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const item of cookieHeader.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function passwordIsValid(password: string) {
  const { ADMIN_PASSWORD } = getSecrets();
  return safeEqual(password, ADMIN_PASSWORD!);
}

export async function createAdminCookie() {
  const { ADMIN_SESSION_SECRET } = getSecrets();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expiresAt);
  const signature = await hmac(payload, ADMIN_SESSION_SECRET!);
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || Number(payload) <= Math.floor(Date.now() / 1000)) return false;
  const { ADMIN_SESSION_SECRET } = getSecrets();
  return safeEqual(signature, await hmac(payload, ADMIN_SESSION_SECRET!));
}
