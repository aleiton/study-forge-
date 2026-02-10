"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useGoal, useDeleteGoal } from "@/hooks/useGoals";
import GoalProgressBar from "@/components/GoalProgressBar";
import styles from "./goalDetail.module.css";

function goalTypeBadge(type: string) {
  switch (type) {
    case "academy":
      return styles.badgeAcademy;
    case "industry":
      return styles.badgeIndustry;
    case "certification":
      return styles.badgeCertification;
    default:
      return styles.badgeGeneral;
  }
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: goal, isLoading } = useGoal(id);
  const deleteGoal = useDeleteGoal();
  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;
  if (!goal) return <p>Goal not found.</p>;

  const attrs = goal.attributes;

  async function handleDelete() {
    if (confirm("Delete this goal?")) {
      await deleteGoal.mutateAsync(id);
      router.push("/goals");
    }
  }

  return (
    <div>
      <Link href="/goals" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Goals
      </Link>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{attrs.title}</h1>
          <span className={goalTypeBadge(attrs.goal_type)}>
            {attrs.goal_type}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className={styles.progressSection}>
        <GoalProgressBar progress={attrs.progress_pct} size="lg" />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Year</div>
          <div className={styles.statValue}>{attrs.year}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Status</div>
          <div className={styles.statValue}>
            {attrs.status.replace("_", " ")}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Progress</div>
          <div className={styles.statValue}>{attrs.progress_pct}%</div>
        </div>
        {attrs.target_date && (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Target Date</div>
            <div className={styles.statValue}>
              {new Date(attrs.target_date).toLocaleDateString()}
            </div>
          </div>
        )}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Plan Items</div>
          <div className={styles.statValue}>
            {attrs.monthly_plan_items_count}
          </div>
        </div>
      </div>

      {attrs.description && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{attrs.description}</p>
        </div>
      )}
    </div>
  );
}
