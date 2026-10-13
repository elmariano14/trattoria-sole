import { isAdmin } from "@/lib/auth";
import { menuQrPng } from "@/lib/qr";

/** Kod QR do menu generowany dla bieżącego adresu strony (NEXT_PUBLIC_SITE_URL). */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Brak dostępu", { status: 401 });
  const png = await menuQrPng(1200);
  const download = new URL(request.url).searchParams.has("pobierz");
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
      ...(download ? { "Content-Disposition": 'attachment; filename="trattoria-sole-menu-qr.png"' } : {}),
    },
  });
}
