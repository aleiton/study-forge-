"use client";

import styles from "./GoalProgressBar.module.css";

interface GoalProgressBarProps {
  progress: number; // 0 to 100
  size?: "sm" | "md" | "lg";
}

function getColor(progress: number): string {
  if (progress >= 75) return "#16a34a"; // green
  if (progress >= 40) return "#f59e0b"; // yellow
  return "#dc2626"; // red
}

export default function GoalProgressBar({
  progress,
  size = "md",
}: GoalProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const color = getColor(clamped);

  const trackClass = styles[`track${size.charAt(0).toUpperCase() + size.slice(1)}`];
  const pctClass = styles[`percentage${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <div className={styles.container}>
      <div className={trackClass}>
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span className={pctClass}>{Math.round(clamped)}%</span>
    </div>
  );
}
