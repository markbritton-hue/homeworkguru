import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create a free Homework Guru account to start getting guided homework help.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
