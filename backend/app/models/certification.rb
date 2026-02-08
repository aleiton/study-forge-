class Certification < ApplicationRecord
  enum :status, { interested: 0, studying: 1, scheduled: 2, passed: 3, failed: 4, expired: 5 }

  validates :name, presence: true
  validates :study_progress_pct, numericality: { in: 0..100 }

  scope :expiring_soon, ->(days = 90) {
    passed
      .where.not(expiry_date: nil)
      .where(expiry_date: ..days.days.from_now.to_date)
  }
end
