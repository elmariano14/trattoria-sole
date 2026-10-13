"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const next = useSearchParams().get("next") ?? "/admin";

  return (
    <form action={action} className="mt-8 grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="field-label text-pane">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="field text-castagna"
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "password-err" : undefined}
        />
        {state.error && (
          <p id="password-err" role="alert" className="mt-2 text-sm text-zafferano">
            {state.error}
          </p>
        )}
      </div>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Sprawdzam…" : "Zaloguj się"}
      </button>
    </form>
  );
}
