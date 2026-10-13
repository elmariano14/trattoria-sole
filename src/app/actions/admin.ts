"use server";

import { refresh, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AVAILABILITY_TAG } from "@/lib/availability";
import { db } from "@/lib/db";
import { getDish } from "@/lib/menu";
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/session";
import { isOrderStatus, isReservationStatus } from "@/lib/status";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    // Drobne opóźnienie utrudnia zgadywanie hasła metodą prób.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Nieprawidłowe hasło." };
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/logowanie");
}

export async function setOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!isOrderStatus(status)) throw new Error("Nieznany status");
  await db.order.update({ where: { id }, data: { status } });
  refresh();
}

export async function setReservationStatus(id: string, status: string) {
  await requireAdmin();
  if (!isReservationStatus(status)) throw new Error("Nieznany status");
  await db.reservation.update({ where: { id }, data: { status } });
  refresh();
}

export async function setDishAvailability(dishId: string, available: boolean) {
  await requireAdmin();
  if (!getDish(dishId)) throw new Error("Nieznane danie");
  await db.dishAvailability.upsert({
    where: { dishId },
    create: { dishId, available },
    update: { available },
  });
  // Strona menu jest w cache – unieważniamy go, żeby goście od razu zobaczyli zmianę.
  updateTag(AVAILABILITY_TAG);
  refresh();
}
