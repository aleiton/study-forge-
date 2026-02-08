Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      devise_for :users, path: "", path_names: {
        sign_in: "login",
        sign_out: "logout",
        registration: "signup"
      }, controllers: {
        sessions: "api/v1/sessions",
        registrations: "api/v1/registrations"
      }

      resources :topics do
        resources :resources, shallow: true
        resources :review_sessions, shallow: true
        member { post :log_practice }
        collection { get :rusty }
      end

      resources :annual_goals
      resources :monthly_plans do
        resources :monthly_plan_items, shallow: true
      end
      resources :certifications
      resources :review_sessions, only: [:index, :update] do
        collection { get :upcoming }
        member { post :complete }
      end
      resources :study_logs
      resources :resources, only: [:index]

      get "dashboard", to: "dashboard#show"
    end
  end
end
