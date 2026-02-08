class Topic < ApplicationRecord
  enum :category, { academy: 0, industry: 1 }
  enum :proficiency_level, { beginner: 0, familiar: 1, proficient: 2, expert: 3 }

  belongs_to :parent_topic, class_name: "Topic", optional: true
  has_many :subtopics, class_name: "Topic", foreign_key: :parent_topic_id, dependent: :nullify

  has_many :resources, dependent: :destroy
  has_many :review_sessions, dependent: :destroy
  has_many :study_logs, dependent: :destroy
  has_many :monthly_plan_items, dependent: :destroy

  validates :name, presence: true
  validates :category, presence: true
  validates :decay_rate, numericality: { greater_than: 0, less_than_or_equal_to: 1 }

  scope :rusty, -> {
    where.not(last_practiced_at: nil)
      .order(last_practiced_at: :asc)
  }

  def freshness_score
    return 0.0 if last_practiced_at.nil?

    days_since = (Time.current - last_practiced_at) / 1.day
    Math.exp(-decay_rate * days_since)
  end

  def freshness_label
    score = freshness_score
    if score > 0.7 then "fresh"
    elsif score > 0.4 then "fading"
    elsif score > 0.15 then "rusty"
    else "very_rusty"
    end
  end
end
