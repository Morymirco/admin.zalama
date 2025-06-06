import type { Metadata } from "next";
// Utilisation de CSS standard pour les polices au lieu de next/font/google
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "react-hot-toast";
import FirebaseAuthProvider from "@/components/auth/FirebaseAuthProvider";

// Nous utiliserons des polices système au lieu des polices Google pour éviter les problèmes avec Turbopack

export const metadata: Metadata = {
  title: "Zalama Admin",
  description: "Panneau d'administration Zalama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <body
        className="font-sans antialiased"
      >
        <ThemeProvider>
          <FirebaseAuthProvider>
            <NotificationProvider>
              {children}
              <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--zalama-card)',
                  color: 'var(--zalama-text)',
                  border: '1px solid var(--zalama-border)',
                },
                success: {
                  style: {
                    border: '1px solid var(--zalama-success)',
                  },
                  iconTheme: {
                    primary: 'var(--zalama-success)',
                    secondary: 'white',
                  },
                },
                error: {
                  style: {
                    border: '1px solid var(--zalama-danger)',
                  },
                  iconTheme: {
                    primary: 'var(--zalama-danger)',
                    secondary: 'white',
                  },
                },
              }}
            />
            </NotificationProvider>
          </FirebaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
