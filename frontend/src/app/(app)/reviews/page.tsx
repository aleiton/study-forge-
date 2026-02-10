"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useReviews,
  useCompleteReview,
  type ReviewSession,
} from "@/hooks/useReviews";
import styles from "./reviews.module.css";

const QUALITY_LABELS: Record<number, string> = {
  0: "Total blackout",
  1: "Incorrect, but remembered on seeing answer",
  2: "Incorrect, but answer seemed easy to recall",
  3: "Correct, with serious difficulty",
  4: "Correct, after some hesitation",
  5: "Perfect response",
};

export default function ReviewsPage() {
  const { data: sessions, isLoading } = useReviews({ status: "scheduled" });
  const [completing, setCompleting] = useState<ReviewSession | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const overdue = sessions?.filter(
    (s) => s.attributes.scheduled_date < today
  ) ?? [];
  const upcoming = sessions?.filter(
    (s) => s.attributes.scheduled_date >= today
  ) ?? [];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Reviews</h1>
      </div>

      {isLoading ? (
        <p className={styles.empty}>Loading...</p>
      ) : !sessions?.length ? (
        <p className={styles.empty}>
          No reviews scheduled. Schedule a review from a topic page.
        </p>
      ) : (
        <>
          {overdue.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Overdue</h2>
                <span className={styles.countOverdue}>{overdue.length}</span>
              </div>
              <div className={styles.grid}>
                {overdue.map((session) => (
                  <ReviewCard
                    key={session.id}
                    session={session}
                    isOverdue
                    onStartReview={() => setCompleting(session)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming</h2>
              <span className={styles.countUpcoming}>{upcoming.length}</span>
            </div>
            {upcoming.length ? (
              <div className={styles.grid}>
                {upcoming.map((session) => (
                  <ReviewCard
                    key={session.id}
                    session={session}
                    onStartReview={() => setCompleting(session)}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No upcoming reviews.</p>
            )}
          </div>
        </>
      )}

      {completing && (
        <CompleteReviewModal
          session={completing}
          onClose={() => setCompleting(null)}
        />
      )}
    </div>
  );
}

function ReviewCard({
  session,
  isOverdue,
  onStartReview,
}: {
  session: ReviewSession;
  isOverdue?: boolean;
  onStartReview: () => void;
}) {
  const attrs = session.attributes;
  const date = new Date(attrs.scheduled_date).toLocaleDateString();

  return (
    <div className={isOverdue ? styles.cardOverdue : styles.card}>
      <div className={styles.cardHeader}>
        <Link href={`/reviews/${session.id}`} className={styles.topicName}>
          {attrs.topic_name}
        </Link>
        <span className={isOverdue ? styles.badgeOverdue : styles.badgeScheduled}>
          {isOverdue ? "overdue" : "scheduled"}
        </span>
      </div>
      <div className={styles.cardMeta}>
        <span>{date}</span>
        <span>Interval: {attrs.interval_days}d</span>
        <span>Rep #{attrs.repetition_number}</span>
      </div>
      <button className={styles.startBtn} onClick={onStartReview}>
        Start Review
      </button>
    </div>
  );
}

function CompleteReviewModal({
  session,
  onClose,
}: {
  session: ReviewSession;
  onClose: () => void;
}) {
  const completeReview = useCompleteReview();
  const [quality, setQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quality === null) return;
    await completeReview.mutateAsync({
      id: session.id,
      quality_rating: quality,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          Complete Review: {session.attributes.topic_name}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Quality Rating</label>
            <div className={styles.ratingGroup}>
              {[0, 1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={
                    quality === q ? styles.ratingBtnActive : styles.ratingBtn
                  }
                  onClick={() => setQuality(q)}
                >
                  {q} — {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Notes (optional)</label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How did it go?"
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
              disabled={quality === null || completeReview.isPending}
            >
              {completeReview.isPending ? "Completing..." : "Complete Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
