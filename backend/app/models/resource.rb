class Resource < ApplicationRecord
  enum :resource_type, { book: 0, documentation: 1, course: 2, video: 3, article: 4, tool: 5 }

  belongs_to :topic

  validates :title, presence: true
  validates :progress_pct, numericality: { in: 0..100 }
end
