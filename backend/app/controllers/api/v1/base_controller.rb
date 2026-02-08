class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!

  private

  def render_error(message, status: :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_not_found
    render json: { error: "Not found" }, status: :not_found
  end
end
