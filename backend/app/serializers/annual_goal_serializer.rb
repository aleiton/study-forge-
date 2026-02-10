class AnnualGoalSerializer
  include JSONAPI::Serializer

  attributes :year, :title, :description, :goal_type, :status,
             :progress_pct, :target_date, :created_at, :updated_at

  attribute :monthly_plan_items_count do |goal|
    goal.monthly_plan_items.count
  end
end
