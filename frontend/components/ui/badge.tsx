import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary",
  {
    variants: {
      variant: {
        default:
          "border-[#F7D2BC] bg-[#FCEEE5] text-[#D97736] font-semibold",
        secondary:
          "border-[#E8DFD1] bg-[#F1EADF] text-[#777064]",
        destructive:
          "border-[#F3C8C2] bg-[#FDF2F0] text-[#C65345]",
        outline:
          "border-[#E8DFD1] text-[#777064] bg-transparent",
        success:
          "border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] font-semibold",
        warning:
          "border-[#F9E2BE] bg-[#FEF8ED] text-[#C58A32] font-semibold",
        verified:
          "border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] font-mono font-medium shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
