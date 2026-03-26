import type { Metadata } from "next"
import { Orbitron, Rajdhani } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", weight: ["700", "900"] })
const rajdhani = Rajdhani({ subsets: ["latin"], variable: "--font-rajdhani", weight: ["400", "600", "700"] })

export const metadata: Metadata = {
  title: "Homework Guru",
  description: "Work through homework problems with an AI tutor that teaches, not just answers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="h-full font-[family-name:var(--font-rajdhani)]">{children}</body>
    </html>
  )
}
