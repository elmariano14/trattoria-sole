import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/**
 * Właściwa kontrola dostępu. Proxy robi tylko szybkie przekierowanie –
 * każda akcja i strona panelu i tak sprawdza sesję tutaj.
 */
export async function isAdmin(): Promise<boolean> {
  // Sesja zależy od żądania i bieżącego czasu – nigdy nie prerenderujemy tej kontroli.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/logowanie");
}
