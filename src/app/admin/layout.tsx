import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel obsługi", template: "%s | Panel Trattoria Sole" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f8f1e4]">{children}</div>;
}
