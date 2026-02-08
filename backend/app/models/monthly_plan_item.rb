class MonthlyPlanItem < ApplicationRecord
  enum :status, { pending: 0, in_progress: 1, completed: 2, skipped: 3 }

  belongs_to :monthly_plan
  belongs_to :topic
  belongs_to :annual_goal, optional: true

  has_many :study_logs, dependent: :nullify

  validates :status, presence: true
end
