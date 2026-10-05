"use client";

import { Sheet } from "@/components/ui/sheet";
import { NavList } from "./nav-list";
import { useUIStore } from "@/store/ui-store";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const t = useTranslations("common");

  return (
    <Sheet open={open} onClose={() => setOpen(false)} side="start" title={t("menu")}>
      <div className="p-3">
        <NavList onNavigate={() => setOpen(false)} />
      </div>
    </Sheet>
  );
}
