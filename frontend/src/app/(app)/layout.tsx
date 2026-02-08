"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Calendar,
  RefreshCw,
  Award,
  Library,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import styles from "./layout.module.css";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/monthly-plans", label: "Monthly Plans", icon: Calendar },
  { href: "/reviews", label: "Reviews", icon: RefreshCw },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/study-log", label: "Study Log", icon: Clock },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>StudyForge</div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={
              pathname.startsWith(href) ? styles.navLinkActive : styles.navLink
            }
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <div className={styles.spacer} />
        <button
          className={styles.logoutBtn}
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
