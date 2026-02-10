"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useReviews, useCompleteReview } from "@/hooks/useReviews";
import styles from "./reviewDetail.module.css";

const QUALITY_LABELS: Record<number, string> = {
  0: "Total blackout",
  1: "Incorrect, but remembered on seeing answer",
  2: "Incorrect, but answer seemed easy to recall",
  3: "Correct, with serious difficulty",
  4: "Correct, after some hesitation",
  5: "Perfect response",
};

function statusClass(status: string) {
  switch (status) {
    case "completed":
      return styles.badgeCompleted;
    case "missed":
      return styles.badgeMissed;
    case "skipped":
      return styles.badgeSkipped;
    default:
      return styles.badgeScheduled;
  }
}

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: sessions, isLoading } = useReviews();
  const completeReview = useCompleteReview();
  const router = useRouter();
  const [quality, setQuality] = useState<number | null>(null);

  const session = sessions?.find((s) => s.id === id);

  if (isLoading) return <p>Loading...</p>;
  if (!session) return <p>Review session not found.</p>;

  const attrs = session.attributes;

  async function handleComplete() {
    if (quality === null) return;
    await completeReview.mutateAsync({ id, quality_rating: quality });
    router.push("/reviews");
  }

  return (
    <div>
      <Link href="/reviews" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Reviews
      </Link>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{attrs.topic_name}</h1>
          <span className={statusClass(attrs.status)}>{attrs.status}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Scheduled Date</div>
          <div className={styles.statValue}>
            {new Date(attrs.scheduled_date).toLocaleDateString()}
          </div>
        </div>
        {attrs.completed_date && (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Completed Date</div>
            <div className={styles.statValue}>
              {new Date(attrs.completed_date).toLocaleDateString()}
            </div>
          </div>
        )}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Interval</div>
          <div className={styles.statValue}>{attrs.interval_days} days</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ease Factor</div>
          <div className={styles.statValue}>{attrs.ease_factor}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Repetition</div>
          <div className={styles.statValue}>#{attrs.repetition_number}</div>
        </div>
        {attrs.quality_rating !== null && (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Quality Rating</div>
            <div className={styles.statValue}>
              {attrs.quality_rating}/5
            </div>
          </div>
        )}
      </div>

      {attrs.status === "scheduled" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Complete this review</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: `1px solid ${quality === q ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    background: quality === q ? "var(--primary)" : "var(--card-bg)",
                    color: quality === q ? "#fff" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontFamily: "inherit",
                    textAlign: "left" as const,
                  }}
                >
                  {q} — {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.completeBtn}
                onClick={handleComplete}
                disabled={quality === null || completeReview.isPending}
              >
                {completeReview.isPending ? "Completing..." : "Complete Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {attrs.notes && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notes</h2>
          <p className={styles.notes}>{attrs.notes}</p>
        </div>
      )}
    </div>
  );
}
