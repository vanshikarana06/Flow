import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary font-semibold",
        destructive:
          "bg-[#FDF2F0] text-[#C65345] border border-[#F3C8C2] hover:bg-[#C65345] hover:text-white",
        outline:
          "border border-[#E8DFD1] bg-transparent hover:bg-[#F1EADF] text-[#29251F]",
        secondary:
          "bg-[#F1EADF] text-[#29251F] hover:bg-[#E5DCCE] border border-[#E8DFD1]",
        ghost:
          "hover:bg-[#F1EADF] text-[#777064] hover:text-[#29251F]",
        link:
          "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-[#FFFCF6]/80 text-[#29251F] hover:bg-[#FFFCF6] border border-[#E8DFD1] shadow-soft",
        success:
          "bg-[#EDF5F0] text-[#477A58] border border-[#CDE3D5] hover:bg-[#477A58] hover:text-white font-semibold",
        warning:
          "bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE] hover:bg-[#C58A32] hover:text-white font-semibold",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-[11px]",
        lg: "h-10 rounded-lg px-6 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
