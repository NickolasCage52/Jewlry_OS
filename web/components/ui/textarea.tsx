import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = "", error, ...rest }, ref) {
    const cls = [
      "ui-textarea",
      error ? "ui-textarea--error" : "",
      "ui-focusable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        ref={ref}
        className={cls}
        aria-invalid={error || undefined}
        {...rest}
      />
    );
  },
);
