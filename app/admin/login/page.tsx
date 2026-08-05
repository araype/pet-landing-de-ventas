import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/admin") ? params.next : "/admin/productos";

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-bold">Bazar de Aracely</h1>
      <p className="mb-6 text-sm text-[var(--ink)]/70">Panel de administración</p>
      <LoginForm nextPath={next} />
    </div>
  );
}
