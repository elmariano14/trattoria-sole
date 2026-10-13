"use client";

import { useFormStatus } from "react-dom";

/** Przycisk akcji serwerowej z blokadą na czas zapisu (działa też bez JS). */
export function ActionButton({
  action,
  children,
  variant = "primary",
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <form action={action}>
      <Submit variant={variant}>{children}</Submit>
    </form>
  );
}

function Submit({ children, variant }: { children: React.ReactNode; variant: "primary" | "ghost" | "danger" }) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-castagna text-pane hover:bg-castagna-soft",
    ghost: "border border-castagna/25 hover:bg-pane-deep",
    danger: "text-pomodoro hover:bg-pomodoro/10",
  }[variant];
  return (
    <button disabled={pending} className={`min-h-10 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${styles}`}>
      {pending ? "Zapisuję…" : children}
    </button>
  );
}
