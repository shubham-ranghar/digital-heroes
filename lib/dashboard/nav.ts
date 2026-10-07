import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Target, Trophy } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/scores",
    label: "Scores",
    shortLabel: "Scores",
    icon: Target,
  },
  {
    href: "/dashboard/prizes",
    label: "Prize claims",
    shortLabel: "Prizes",
    icon: Trophy,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
  },
];
