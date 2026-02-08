class MonthlyPlan < ApplicationRecord
  enum :status, { draft: 0, active: 1, completed: 2, reviewed: 3 }

  has_many :monthly_plan_items, dependent: :destroy

  validates :year, presence: true
  validates :month, presence: true, inclusion: { in: 1..12 }
  validates :month, uniqueness: { scope: :year }
end
