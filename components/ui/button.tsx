import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "rounded cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive-medium dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        cancel:
          "bg-destructive text-white hover:bg-destructive/80 focus-visible:ring-destructive-medium dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 dark:hover:bg-destructive/90",
        destructive:
          "border border-destructive bg-background text-destructive shadow-xs hover:bg-destructive-medium hover:border-transparent focus-visible:ring-destructive-medium dark:focus-visible:ring-destructive/40 dark:border-destructive dark:bg-background dark:hover:bg-destructive-medium dark:hover:border-transparent",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-background-subtle",
        "accent-ghost": "hover:bg-accent-10",
        link: "text-primary underline-offset-4 hover:underline",
        change:
          "border border-border bg-background shadow-xs hover:border-accent hover:text-accent",
        "accent-outline":
          "border border-accent bg-background text-accent hover:bg-accent/80 hover:text-accent-foreground",
        "accent-rounded":
          "text-base rounded bg-accent hover:bg-accent-hover text-accent-foreground transition-all hover:scale-102",
        login: "bg-transparent text-foreground hover:bg-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
