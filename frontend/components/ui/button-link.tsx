import Link, { LinkProps } from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonLinkProps
  extends LinkProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variantStyles = {
      primary: "bg-app-primary text-white hover:bg-app-primaryHover active:bg-app-primaryActive",
      secondary: "border border-app-border bg-app-surface text-app-text hover:bg-app-soft",
      tertiary: "text-app-primary hover:bg-app-soft active:bg-white/60",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
      ghost: "text-app-muted hover:text-app-text hover:bg-white/40",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs rounded-md",
      md: "h-9 px-3 text-sm rounded-md",
      lg: "h-10 px-4 text-sm rounded-md",
      icon: "h-9 w-9 rounded-md",
      "icon-sm": "h-8 w-8 rounded-md",
    };

    return (
      <Link
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonLink.displayName = "ButtonLink";

export { ButtonLink };
