export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br"><body>
      <nav style={{padding:12,borderBottom:"1px solid #eee"}}>
        <a href="/admin">Dashboard</a> · <a href="/admin/services">Serviços</a> · <a href="/admin/employees">Profissionais</a> · <a href="/admin/clients">Clientes</a>
      </nav>
      <main style={{padding:16}}>{children}</main>
    </body></html>
  );
}
