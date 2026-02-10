class Api::V1::TopicsController < Api::V1::BaseController
  before_action :set_topic, only: [:show, :update, :destroy, :log_practice]

  def index
    topics = Topic.all
    topics = topics.where(category: params[:category]) if params[:category].present?
    topics = topics.where(subcategory: params[:subcategory]) if params[:subcategory].present?
    topics = topics.where(parent_topic_id: nil) if params[:root_only] == "true"
    topics = topics.includes(:subtopics).order(:name)

    render json: TopicSerializer.new(topics).serializable_hash
  end

  def show
    render json: TopicSerializer.new(@topic, include: [:subtopics]).serializable_hash
  end

  def create
    topic = Topic.new(topic_params)

    if topic.save
      render json: TopicSerializer.new(topic).serializable_hash, status: :created
    else
      render json: { errors: topic.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @topic.update(topic_params)
      render json: TopicSerializer.new(@topic).serializable_hash
    else
      render json: { errors: @topic.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @topic.destroy!
    head :no_content
  end

  def rusty
    topics = RustinessService.rusty_topics(Topic.all)
    summary = RustinessService.freshness_summary(Topic.all)
    render json: TopicSerializer.new(topics).serializable_hash.merge(meta: { freshness_summary: summary })
  end

  def log_practice
    @topic.update!(last_practiced_at: Time.current)
    render json: TopicSerializer.new(@topic).serializable_hash
  end

  private

  def set_topic
    @topic = Topic.find(params[:id])
  end

  def topic_params
    params.require(:topic).permit(
      :name, :category, :subcategory, :description,
      :parent_topic_id, :decay_rate, :proficiency_level
    )
  end
end
