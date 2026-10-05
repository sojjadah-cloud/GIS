import type { LucideIcon } from "lucide-react";
import {
  Home,
  Map,
  ClipboardList,
  AlertTriangle,
  LayoutDashboard,
  Lightbulb,
  Banknote,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

// Mirrors the reference site's information architecture exactly (8 pages).
export const navItems: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/map", labelKey: "map", icon: Map },
  { href: "/survey", labelKey: "survey", icon: ClipboardList },
  { href: "/flood-risk", labelKey: "floodRisk", icon: AlertTriangle },
  { href: "/survey-dashboard", labelKey: "surveyDashboard", icon: LayoutDashboard },
  { href: "/recommended", labelKey: "recommended", icon: Lightbulb },
  { href: "/damage-cost", labelKey: "damageCost", icon: Banknote },
  { href: "/about", labelKey: "about", icon: Users },
];
