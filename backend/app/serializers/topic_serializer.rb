class TopicSerializer
  include JSONAPI::Serializer

  attributes :name, :category, :subcategory, :description,
             :decay_rate, :last_practiced_at, :proficiency_level,
             :created_at, :updated_at

  attribute :freshness_score do |topic|
    topic.freshness_score.round(3)
  end

  attribute :freshness_label do |topic|
    topic.freshness_label
  end

  belongs_to :parent_topic, serializer: TopicSerializer, if: proc { |topic| topic.parent_topic_id.present? }
  has_many :subtopics, serializer: TopicSerializer
end
