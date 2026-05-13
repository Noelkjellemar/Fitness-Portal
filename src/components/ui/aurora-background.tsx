"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `pointer-events-none absolute -inset-[10px] opacity-60
            [--aurora:repeating-linear-gradient(100deg,#8B5CF6_10%,#B19CD9_15%,#C8B6E5_20%,#C8A2DC_25%,transparent_30%)]
            [--dark-gradient:repeating-linear-gradient(100deg,#0F0A18_0%,#0F0A18_7%,transparent_10%,transparent_12%,#0F0A18_16%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            after:content-[''] after:absolute after:inset-0
            after:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:[background-attachment:fixed]
            after:mix-blend-difference
            filter blur-[10px] invert-0
            animate-aurora`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
      </div>
      {children}
    </div>
  );
};
