import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  variant?: "default" | "cream";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className = "", error, variant = "default", ...rest },
    ref,
  ) {
    const cls = [
      "ui-input",
      variant === "cream" ? "ui-input--cream" : "",
      error ? "ui-input--error" : "",
      "ui-focusable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={ref}
        className={cls}
        aria-invalid={error || undefined}
        {...rest}
      />
    );
  },
);
