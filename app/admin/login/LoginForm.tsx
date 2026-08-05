"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "../actions";

const initialState: FormState = {};

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-none border-2 border-[var(--ink)] bg-white px-3 py-2 outline-none focus:border-[var(--coral)]"
        />
      </div>
      {state.error && <p className="text-sm text-[var(--coral)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--coral)] px-4 py-3 font-semibold text-white shadow-[0_6px_0_#a82c19] transition active:translate-y-1 active:shadow-none disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
