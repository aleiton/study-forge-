class ReviewSchedulerService
  DEFAULT_EASE_FACTOR = 2.5
  MIN_EASE_FACTOR = 1.3

  def self.schedule_next_review(topic)
    topic.review_sessions.create!(
      scheduled_date: Date.current,
      interval_days: 1,
      ease_factor: DEFAULT_EASE_FACTOR,
      repetition_number: 1,
      status: :scheduled
    )
  end

  def self.complete_review(review_session, quality_rating)
    raise ArgumentError, "quality_rating must be between 0 and 5" unless (0..5).cover?(quality_rating)

    ActiveRecord::Base.transaction do
      review_session.update!(
        status: :completed,
        completed_date: Date.current,
        quality_rating: quality_rating
      )

      new_params = calculate_sm2(
        repetition: review_session.repetition_number,
        ease_factor: review_session.ease_factor,
        interval: review_session.interval_days,
        quality: quality_rating
      )

      next_session = review_session.topic.review_sessions.create!(
        scheduled_date: Date.current + new_params[:interval].days,
        interval_days: new_params[:interval],
        ease_factor: new_params[:ease_factor],
        repetition_number: new_params[:repetition],
        status: :scheduled
      )

      StudyLog.create!(
        topic: review_session.topic,
        date: Date.current,
        hours: 0.5,
        log_type: :review,
        notes: "Review completed with quality #{quality_rating}/5"
      )

      { completed: review_session, next_session: next_session }
    end
  end

  def self.calculate_sm2(repetition:, ease_factor:, interval:, quality:)
    if quality < 3
      { repetition: 1, interval: 1, ease_factor: ease_factor }
    else
      new_repetition = repetition + 1

      new_interval = case new_repetition
                     when 1 then 1
                     when 2 then 6
                     else (interval * ease_factor).round
                     end

      new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      new_ef = [new_ef, MIN_EASE_FACTOR].max

      { repetition: new_repetition, interval: new_interval, ease_factor: new_ef.round(2) }
    end
  end
end
