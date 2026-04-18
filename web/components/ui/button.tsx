import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "default" | "primary" | "gold" | "ghost";
export type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  default: "ui-btn",
  primary: "ui-btn ui-btn--primary",
  gold: "ui-btn ui-btn--gold",
  ghost: "ui-btn ui-btn--ghost",
};

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = [
    variantClass[variant],
    size === "sm" ? "ui-btn--sm" : "",
    loading ? "ui-btn--loading" : "",
    "ui-focusable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="ui-btn__spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}
