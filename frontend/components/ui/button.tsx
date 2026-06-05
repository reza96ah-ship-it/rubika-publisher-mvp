import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
};

type ButtonAsButtonProps = SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type ButtonAsLinkProps = SharedButtonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  disabled?: boolean;
};

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;
type NativeButtonType = NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["type"]>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-app-primary bg-app-primary text-white shadow-accent hover:border-app-primaryHover hover:bg-app-primaryHover",
  secondary: "border border-app-border bg-white text-slate-700 shadow-hairline hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary",
  ghost: "border border-transparent bg-transparent text-slate-600 hover:bg-blue-50 hover:text-app-primary",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm"
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const classes = [
    "app-interactive inline-flex items-center justify-center rounded-nsm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus/30 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(" ");

  if ("href" in props && props.href) {
    const { href, disabled, variant: _variant, size: _size, className: _className, children: _children, ...linkProps } = props;

    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled || linkProps["aria-disabled"]}
        tabIndex={disabled ? -1 : linkProps.tabIndex}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, children: _children, type: buttonType, ...buttonProps } = props as ButtonAsButtonProps;
  const type: NativeButtonType = buttonType ?? "button";

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
