import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      {authed && (
        <header className="border-b-2 border-[var(--ink)]/16 bg-[var(--paper)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/admin/productos" className="font-display text-lg font-bold">
              Bazar de Aracely — Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/productos" className="hover:underline">
                Productos
              </Link>
              <Link href="/admin/productos/nuevo" className="hover:underline">
                Agregar producto
              </Link>
              <Link href="/" className="hover:underline" target="_blank">
                Ver sitio
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border-2 border-[var(--ink)] px-3 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  Cerrar sesión
                </button>
              </form>
            </nav>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
