import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({ variant = "primary", size = "md", className, children, style, ...props }: ButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"

  const baseStyle: React.CSSProperties =
    variant === "primary"
      ? { background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff" }
      : variant === "secondary"
      ? { background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)" }
      : { color: "var(--muted)" }

  return (
    <button
      className={twMerge(
        `inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${sizeClass}`,
        className
      )}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
