"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.ComponentProps<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand/30 shadow-sm shadow-brand/10",
  secondary:
    "border border-border bg-card text-charcoal hover:bg-surface hover:border-border/80 focus-visible:ring-charcoal/10",
  danger:
    "border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus-visible:ring-red-500/20",
  ghost:
    "text-charcoal hover:bg-surface focus-visible:ring-charcoal/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2.5",
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4.5 w-4.5",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    icon: Icon,
    iconPosition = "left",
    className,
    children,
    ...rest
  } = props;

  const baseClass = cn(
    "inline-flex items-center justify-center rounded-lg font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const iconEl = loading ? (
    <Loader2 className={cn(iconSizes[size], "animate-spin")} />
  ) : Icon ? (
    <Icon className={iconSizes[size]} />
  ) : null;

  const content = (
    <>
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={baseClass} {...linkRest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={baseClass}
      disabled={loading || (rest as ButtonAsButton).disabled}
      {...(rest as ButtonAsButton)}
    >
      {content}
    </button>
  );
});
