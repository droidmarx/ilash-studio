import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'I Lash Studio | Luxury Agenda',
  description: 'Sistema de agendamento premium para Lash Designers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'I Lash Studio',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 overflow-x-hidden">
        <div className="sparkle-bg">
          {/* Brilhos Flutuantes */}
          {[...Array(40)].map((_, i) => (
            <div 
              key={`sparkle-${i}`} 
              className="sparkle bg-gold-gradient" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                opacity: 0.4 + Math.random() * 0.5
              }}
            />
          ))}

          {/* Estrelas Cadentes Discretas */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={`star-${i}`}
              className="shooting-star"
              style={{
                top: `${Math.random() * 40}%`,
                animationDelay: `${i * 7 + Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}
