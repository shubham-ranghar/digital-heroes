"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-status-active" />,
        info: <InfoIcon className="size-4 text-navy" />,
        warning: <TriangleAlertIcon className="size-4 text-status-pending" />,
        error: <OctagonXIcon className="size-4 text-status-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-slate" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-line bg-surface text-navy shadow-lg",
          title: "font-sans text-sm",
          description: "text-slate text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
