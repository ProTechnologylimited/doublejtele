"use client";
import { usePathname } from "next/navigation";
export default function HideOnAdmin({ children }: { children: React.ReactNode }) { return usePathname()?.startsWith("/admin") ? null : <>{children}</>; }
