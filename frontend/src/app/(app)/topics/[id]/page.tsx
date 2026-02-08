"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTopic, useDeleteTopic } from "@/hooks/useTopics";
import styles from "./topicDetail.module.css";

function freshnessClass(label: string) {
  switch (label) {
    case "fresh":
      return styles.badgeFresh;
    case "fading":
      return styles.badgeFading;
    case "rusty":
      return styles.badgeRusty;
    case "very_rusty":
      return styles.badgeVeryRusty;
    default:
      return styles.badgeNew;
  }
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: topic, isLoading } = useTopic(id);
  const deleteTopic = useDeleteTopic();
  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;
  if (!topic) return <p>Topic not found.</p>;

  const attrs = topic.attributes;
  const label = attrs.last_practiced_at ? attrs.freshness_label : "new";

  async function handleDelete() {
    if (confirm("Delete this topic?")) {
      await deleteTopic.mutateAsync(id);
      router.push("/topics");
    }
  }

  return (
    <div>
      <Link href="/topics" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Topics
      </Link>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{attrs.name}</h1>
          <span className={freshnessClass(label)}>
            {label.replace("_", " ")}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Category</div>
          <div className={styles.statValue}>{attrs.category}</div>
        </div>
        {attrs.subcategory && (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Subcategory</div>
            <div className={styles.statValue}>
              {attrs.subcategory.replace("_", " ")}
            </div>
          </div>
        )}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Proficiency</div>
          <div className={styles.statValue}>{attrs.proficiency_level}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Freshness Score</div>
          <div className={styles.statValue}>
            {(attrs.freshness_score * 100).toFixed(0)}%
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Decay Rate</div>
          <div className={styles.statValue}>{attrs.decay_rate}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Last Practiced</div>
          <div className={styles.statValue}>
            {attrs.last_practiced_at
              ? new Date(attrs.last_practiced_at).toLocaleDateString()
              : "Never"}
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
