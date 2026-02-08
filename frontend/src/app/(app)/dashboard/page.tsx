"use client";

import { useAuth } from "@/lib/auth";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.welcome}>Welcome back, {user?.email}</p>
      <p className={styles.placeholder}>
        Dashboard widgets will be built in Sprint 5.
      </p>
    </div>
  );
}
