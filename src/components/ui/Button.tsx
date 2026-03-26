import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

const variantStyle: Record<string, React.CSSProperties> = {
  primary:   { background: "#60a5fa", color: "#fff", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" },
  secondary: { background: "rgba(30,41,59,0.8)", color: "#fff", border: "1px solid rgba(96,165,250,0.3)" },
  ghost:     { background: "none", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.25)" },
}

const sizeClass: Record<string, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
}

export function Button({ variant = "primary", size = "md", className, children, style, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        `inline-flex items-center justify-center font-semibold rounded-full transition-all hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${sizeClass[size]}`,
        className
      )}
      style={{ ...variantStyle[variant], ...style }}
      onMouseEnter={e => { if (variant === "primary") (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(96,165,250,0.45)" }}
      onMouseLeave={e => { if (variant === "primary") (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(96,165,250,0.3)" }}
      {...props}
    >
      {children}
    </button>
  )
}
