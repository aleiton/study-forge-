"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  useGoals,
  useCreateGoal,
  type AnnualGoal,
} from "@/hooks/useGoals";
import GoalProgressBar from "@/components/GoalProgressBar";
import styles from "./goals.module.css";

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

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

export default function GoalsPage() {
  const [activeYear, setActiveYear] = useState(currentYear);
  const [showCreate, setShowCreate] = useState(false);

  const { data: goals, isLoading } = useGoals({ year: activeYear });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Annual Goals</h1>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New Goal
        </button>
      </div>

      <div className={styles.tabs}>
        {YEARS.map((year) => (
          <button
            key={year}
            className={activeYear === year ? styles.tabActive : styles.tab}
            onClick={() => setActiveYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className={styles.empty}>Loading...</p>
      ) : !goals?.length ? (
        <p className={styles.empty}>
          No goals for {activeYear}. Create one to start tracking.
        </p>
      ) : (
        <div className={styles.grid}>
          {goals.map((goal: AnnualGoal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGoalModal
          year={activeYear}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function GoalCard({ goal }: { goal: AnnualGoal }) {
  const attrs = goal.attributes;

  return (
    <Link href={`/goals/${goal.id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{attrs.title}</span>
        <span className={goalTypeBadge(attrs.goal_type)}>
          {attrs.goal_type}
        </span>
      </div>
      <div className={styles.cardStatus}>
        {attrs.status.replace("_", " ")}
      </div>
      <div className={styles.progressRow}>
        <GoalProgressBar progress={attrs.progress_pct} size="sm" />
      </div>
      {attrs.description && (
        <p className={styles.cardDesc}>{attrs.description}</p>
      )}
    </Link>
  );
}

function CreateGoalModal({
  year,
  onClose,
}: {
  year: number;
  onClose: () => void;
}) {
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<string>("general");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createGoal.mutateAsync({
      year,
      title,
      goal_type: goalType,
      description: description || undefined,
      target_date: targetDate || undefined,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>New Goal for {year}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Type</label>
            <select
              className={styles.select}
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
            >
              <option value="general">General</option>
              <option value="academy">Academy</option>
              <option value="industry">Industry</option>
              <option value="certification">Certification</option>
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

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Target Date (optional)</label>
            <input
              type="date"
              className={styles.input}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
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
              disabled={createGoal.isPending}
            >
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
