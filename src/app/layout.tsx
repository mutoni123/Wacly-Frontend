import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from '@/contexts/AuthContext'
import { viewport } from './viewport'
import { cn } from "@/lib/utils"

// Metadata configuration
export const metadata: Metadata = {
  title: "Wacly HRMS",
  description: "Human Resource Management System by Wacly",
  keywords: ["HRMS", "HR", "Human Resources", "Management", "Wacly"],
  authors: [{ name: "Wacly" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export { viewport }

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans antialiased",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <main className="relative flex flex-col min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}