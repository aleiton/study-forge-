class AnnualGoal < ApplicationRecord
  enum :goal_type, { academy: 0, industry: 1, certification: 2, general: 3 }
  enum :status, { not_started: 0, in_progress: 1, completed: 2, abandoned: 3 }

  has_many :monthly_plan_items, dependent: :nullify

  validates :year, presence: true
  validates :title, presence: true
  validates :progress_pct, numericality: { in: 0..100 }
end
