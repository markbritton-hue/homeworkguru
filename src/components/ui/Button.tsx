import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800": variant === "primary",
            "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50": variant === "secondary",
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100": variant === "ghost",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
