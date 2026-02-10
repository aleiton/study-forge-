class Api::V1::AnnualGoalsController < Api::V1::BaseController
  before_action :set_goal, only: [:show, :update, :destroy]

  def index
    goals = AnnualGoal.all
    goals = goals.where(year: params[:year]) if params[:year].present?
    goals = goals.where(status: params[:status]) if params[:status].present?
    goals = goals.order(year: :desc, created_at: :desc)

    render json: AnnualGoalSerializer.new(goals).serializable_hash
  end

  def show
    render json: AnnualGoalSerializer.new(@goal).serializable_hash
  end

  def create
    goal = AnnualGoal.new(goal_params)

    if goal.save
      render json: AnnualGoalSerializer.new(goal).serializable_hash, status: :created
    else
      render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @goal.update(goal_params)
      render json: AnnualGoalSerializer.new(@goal).serializable_hash
    else
      render json: { errors: @goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @goal.destroy!
    head :no_content
  end

  private

  def set_goal
    @goal = AnnualGoal.find(params[:id])
  end

  def goal_params
    params.require(:annual_goal).permit(
      :year, :title, :description, :goal_type,
      :status, :progress_pct, :target_date
    )
  end
end
