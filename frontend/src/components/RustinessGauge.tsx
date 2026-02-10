"use client";

import styles from "./RustinessGauge.module.css";

interface RustinessGaugeProps {
  score: number; // 0 to 1
  label?: string;
  size?: number; // diameter in px, default 120
}

function getColor(score: number): string {
  if (score > 0.7) return "#16a34a"; // green
  if (score > 0.4) return "#f59e0b"; // yellow
  if (score > 0.15) return "#f97316"; // orange
  return "#dc2626"; // red
}

export default function RustinessGauge({
  score,
  label,
  size = 120,
}: RustinessGaugeProps) {
  const clampedScore = Math.max(0, Math.min(1, score));
  const color = getColor(clampedScore);

  const radius = 40;
  const strokeWidth = 8;
  const cx = 50;
  const cy = 50;

  // Semicircle arc from 180deg to 0deg (left to right)
  const startAngle = Math.PI;
  const endAngle = Math.PI * (1 - clampedScore);

  const bgStartX = cx + radius * Math.cos(Math.PI);
  const bgStartY = cy - radius * Math.sin(Math.PI);
  const bgEndX = cx + radius * Math.cos(0);
  const bgEndY = cy - radius * Math.sin(0);
  const bgPath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`;

  const arcEndX = cx + radius * Math.cos(endAngle);
  const arcEndY = cy - radius * Math.sin(endAngle);
  const largeArc = clampedScore > 0.5 ? 1 : 0;
  const valuePath =
    clampedScore > 0
      ? `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}`
      : "";

  return (
    <div className={styles.container}>
      <svg viewBox="0 0 100 60" width={size} height={size * 0.6}>
        <path
          d={bgPath}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="currentColor"
        >
          {Math.round(clampedScore * 100)}%
        </text>
      </svg>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
