import QRCode from "qrcode";
import { siteUrl } from "./site";

/** Adres, na który prowadzi kod QR ze stolika (z parametrem do statystyk). */
export function menuQrTarget(base = siteUrl()): string {
  return `${base}/menu?utm_source=qr&utm_medium=stolik`;
}

/** PNG kodu QR w kolorach marki. Korekcja błędów H – kod czyta się nawet zabrudzony. */
export function menuQrPng(width = 1200, base?: string): Promise<Buffer> {
  return QRCode.toBuffer(menuQrTarget(base), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width,
    color: { dark: "#24150F", light: "#FFFFFF" },
  });
}
