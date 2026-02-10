class Api::V1::ReviewSessionsController < Api::V1::BaseController
  before_action :set_review_session, only: [:show, :update, :complete]
  before_action :set_topic, only: [:create]

  def index
    sessions = ReviewSession.includes(:topic)
    sessions = sessions.where(status: params[:status]) if params[:status].present?
    sessions = sessions.where(topic_id: params[:topic_id]) if params[:topic_id].present?
    sessions = sessions.order(scheduled_date: :asc)

    render json: ReviewSessionSerializer.new(sessions).serializable_hash
  end

  def show
    render json: ReviewSessionSerializer.new(@review_session).serializable_hash
  end

  def create
    session = ReviewSchedulerService.schedule_next_review(@topic)
    render json: ReviewSessionSerializer.new(session).serializable_hash, status: :created
  end

  def update
    if @review_session.update(update_params)
      render json: ReviewSessionSerializer.new(@review_session).serializable_hash
    else
      render json: { errors: @review_session.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def complete
    quality = params[:quality_rating].to_i
    result = ReviewSchedulerService.complete_review(@review_session, quality)

    render json: {
      completed: ReviewSessionSerializer.new(result[:completed]).serializable_hash,
      next_session: ReviewSessionSerializer.new(result[:next_session]).serializable_hash
    }
  end

  def upcoming
    sessions = ReviewSession.upcoming(params.fetch(:days, 7).to_i)
    render json: ReviewSessionSerializer.new(sessions).serializable_hash
  end

  private

  def set_review_session
    @review_session = ReviewSession.find(params[:id])
  end

  def set_topic
    @topic = Topic.find(params[:topic_id])
  end

  def update_params
    params.require(:review_session).permit(:scheduled_date, :notes)
  end
end
