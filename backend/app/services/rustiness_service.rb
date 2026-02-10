class RustinessService
  LABELS = %w[fresh fading rusty very_rusty never_practiced].freeze

  def self.rusty_topics(scope = Topic.all)
    topics = scope.to_a
    topics.sort_by { |t| t.freshness_score }
  end

  def self.freshness_summary(scope = Topic.all)
    counts = LABELS.index_with { 0 }

    scope.find_each do |topic|
      if topic.last_practiced_at.nil?
        counts["never_practiced"] += 1
      else
        counts[topic.freshness_label] += 1
      end
    end

    counts
  end
end
