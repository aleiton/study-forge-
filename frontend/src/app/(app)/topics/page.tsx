"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTopics, useCreateTopic, type Topic } from "@/hooks/useTopics";
import styles from "./topics.module.css";

const SUBCATEGORIES: Record<string, string[]> = {
  academy: [
    "algorithms",
    "data_structures",
    "os",
    "networks",
    "databases",
    "distributed_systems",
    "system_design",
    "math",
  ],
  industry: [
    "backend",
    "frontend",
    "infra",
    "observability",
    "devops",
    "stacks",
  ],
};

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

export default function TopicsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "academy" | "industry">(
    "all"
  );
  const [showCreate, setShowCreate] = useState(false);

  const filters =
    activeTab === "all" ? undefined : { category: activeTab };
  const { data: topics, isLoading } = useTopics(filters);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Topics</h1>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Add Topic
        </button>
      </div>

      <div className={styles.tabs}>
        {(["all", "academy", "industry"] as const).map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All" : tab === "academy" ? "Academy" : "Industry"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className={styles.empty}>Loading...</p>
      ) : !topics?.length ? (
        <p className={styles.empty}>
          No topics yet. Add your first topic to get started.
        </p>
      ) : (
        <div className={styles.grid}>
          {topics.map((topic: Topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}

      {showCreate && <CreateTopicModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const { attributes: attrs } = topic;
  const label = attrs.last_practiced_at ? attrs.freshness_label : "new";

  return (
    <Link href={`/topics/${topic.id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardName}>{attrs.name}</span>
        <span className={freshnessClass(label)}>{label.replace("_", " ")}</span>
      </div>
      <div className={styles.cardMeta}>
        <span>{attrs.category}</span>
        {attrs.subcategory && <span>{attrs.subcategory}</span>}
        <span>{attrs.proficiency_level}</span>
      </div>
      {attrs.description && (
        <p className={styles.cardDesc}>{attrs.description}</p>
      )}
    </Link>
  );
}

function CreateTopicModal({ onClose }: { onClose: () => void }) {
  const createTopic = useCreateTopic();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"academy" | "industry">("academy");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createTopic.mutateAsync({
      name,
      category,
      subcategory: subcategory || undefined,
      description: description || undefined,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>New Topic</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as "academy" | "industry");
                setSubcategory("");
              }}
            >
              <option value="academy">Academy</option>
              <option value="industry">Industry</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Subcategory</label>
            <select
              className={styles.select}
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">-- Select --</option>
              {SUBCATEGORIES[category].map((sub) => (
                <option key={sub} value={sub}>
                  {sub.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={createTopic.isPending}
            >
              {createTopic.isPending ? "Creating..." : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
