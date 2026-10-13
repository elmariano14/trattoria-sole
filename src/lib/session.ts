/**
 * Podpisany token sesji admina: "<wygaśnięcie>.<HMAC-SHA256>".
 * Tylko Web Crypto, więc działa zarówno w proxy, jak i w Server Actions.
 */

export const SESSION_COOKIE = "sole_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 godzin – jedna zmiana

const encoder = new TextEncoder();

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET musi mieć co najmniej 32 znaki.");
  return s;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Porównanie w stałym czasie – nie zdradza, ile znaków się zgadza. */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${await hmac(`admin.${exp}`)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < now) return false;
  try {
    return safeEqual(sig, await hmac(`admin.${exp}`));
  } catch {
    return false;
  }
}

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Porównujemy skróty, żeby długość hasła nie wpływała na czas odpowiedzi.
  const [a, b] = await Promise.all([hmac(`pw.${input}`), hmac(`pw.${expected}`)]);
  return safeEqual(a, b);
}
