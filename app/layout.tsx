import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Nanum_Pen_Script } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"

// Load the Nanum Pen Script font
const nanumPenScript = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum-pen-script",
})

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Efficient Team Management and Employee Performance Optimization",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={nanumPenScript.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'