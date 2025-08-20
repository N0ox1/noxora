export const metadata = {
  title: "Noxora",
  description: "SaaS multi-tenant para barbearias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
