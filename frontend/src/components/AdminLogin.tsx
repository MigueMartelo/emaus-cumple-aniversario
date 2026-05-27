import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
  loginError?: string;
}

export function AdminLogin({ onLogin, loginError }: AdminLoginProps) {
  const [draftToken, setDraftToken] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = draftToken.trim();
    if (!token) return;
    onLogin(token);
    setDraftToken('');
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff0c2] text-[#8a5f13]">
            <Lock size={20} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3f2c12]">Acceso admin</h1>
            <p className="mt-1 text-sm text-[#6f6a60]">Ingresa tu token privado para ver el tablero.</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-[#4c4033]" htmlFor="admin-token">
            Token de administrador
            <input
              id="admin-token"
              type="password"
              value={draftToken}
              onChange={(event) => setDraftToken(event.target.value)}
              className="h-12 rounded-md border border-[#d8c6a4] bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-[#8a5f13] focus:ring-2 focus:ring-[#f1e3c6] sm:h-11 sm:text-sm"
            />
          </label>

          {loginError ? (
            <div className="rounded-md border border-[#f1b8b6] bg-[#fff1f0] px-4 py-3 text-sm text-[#9b1012]">{loginError}</div>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#8a5f13] px-5 text-sm font-semibold text-white transition hover:bg-[#704b0f]"
          >
            <Lock size={18} aria-hidden="true" />
            Entrar
          </button>
        </form>
      </div>
    </section>
  );
}
