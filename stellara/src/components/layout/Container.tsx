import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
  as?: "div" | "section" | "main" | "article";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-full",
};

export default function Container({
  children,
  className = "",
  size = "lg",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Component>
  );
}
