import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers/Providers"

const siteUrl = "https://www.homeworkguru.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Homework Guru — AI Homework Tutor for Kids",
    template: "%s | Homework Guru",
  },
  description:
    "Homework Guru is a free AI homework tutor that guides children through problems with hints and questions — not just answers. Upload a photo of any homework sheet and get started in seconds.",
  keywords: [
    "AI homework tutor",
    "homework help for kids",
    "homework helper",
    "maths homework help",
    "primary school homework",
    "AI tutor for children",
    "homework app",
    "Socratic tutor",
    "kids learning app",
  ],
  authors: [{ name: "Homework Guru" }],
  creator: "Homework Guru",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Homework Guru",
    title: "Homework Guru — AI Homework Tutor for Kids",
    description:
      "Upload a photo of your homework and get guided hints from your personal AI tutor. We don't just give out answers — we help you learn.",
    images: [
      {
        url: "/HomeworkguruLogo.png",
        width: 512,
        height: 512,
        alt: "Homework Guru logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Homework Guru — AI Homework Tutor for Kids",
    description:
      "Upload a photo of your homework and get guided hints from your personal AI tutor. We don't just give out answers — we help you learn.",
    images: ["/HomeworkguruLogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  name: "Homework Guru",
  description:
    "An AI homework tutor that guides children through problems with hints and questions — not just answers.",
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
  },
  operatingSystem: "Web",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
