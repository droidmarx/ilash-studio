import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agenda Studio | Lash Design',
  description: 'Sistema de agendamento profissional para Lash Designers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
