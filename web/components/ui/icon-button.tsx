import { forwardRef, type ButtonHTMLAttributes } from "react";

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function IconButton({ className = "", type = "button", ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={`ui-icon-btn ui-focusable ${className}`.trim()}
      {...rest}
    />
  );
});
