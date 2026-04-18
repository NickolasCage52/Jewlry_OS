import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  variant?: "default" | "cream";
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className = "", error, variant = "default", children, ...rest },
    ref,
  ) {
    const cls = [
      "ui-select",
      variant === "cream" ? "ui-select--cream" : "",
      error ? "ui-select--error" : "",
      "ui-focusable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <select
        ref={ref}
        className={cls}
        aria-invalid={error || undefined}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
