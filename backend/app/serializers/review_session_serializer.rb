class ReviewSessionSerializer
  include JSONAPI::Serializer

  attributes :scheduled_date, :completed_date, :quality_rating,
             :interval_days, :ease_factor, :repetition_number,
             :status, :notes, :created_at, :updated_at

  attribute :topic_name do |session|
    session.topic.name
  end

  belongs_to :topic
end
