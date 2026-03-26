import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Homework Guru",
  description: "Work through homework problems with an AI tutor that teaches, not just answers.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
