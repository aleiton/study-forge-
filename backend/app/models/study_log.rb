class StudyLog < ApplicationRecord
  enum :log_type, { study: 0, review: 1, practice: 2, project: 3 }

  belongs_to :topic
  belongs_to :monthly_plan_item, optional: true

  validates :date, presence: true
  validates :hours, presence: true, numericality: { greater_than: 0 }

  after_create :update_topic_last_practiced

  private

  def update_topic_last_practiced
    topic.update!(last_practiced_at: created_at)
  end
end
