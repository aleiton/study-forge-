class ReviewSession < ApplicationRecord
  enum :status, { scheduled: 0, completed: 1, missed: 2, skipped: 3 }

  belongs_to :topic

  validates :scheduled_date, presence: true
  validates :interval_days, numericality: { greater_than: 0 }
  validates :ease_factor, numericality: { greater_than_or_equal_to: 1.3 }
  validates :quality_rating, numericality: { in: 0..5 }, allow_nil: true

  scope :upcoming, ->(days = 7) {
    scheduled
      .where(scheduled_date: Date.current..days.days.from_now.to_date)
      .order(:scheduled_date)
  }

  scope :overdue, -> {
    scheduled
      .where(scheduled_date: ...Date.current)
      .order(:scheduled_date)
  }
end
