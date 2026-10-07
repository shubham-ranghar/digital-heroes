import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Gift,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/draws", label: "Draws", icon: Sparkles },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/winners", label: "Winners", icon: Gift },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];
