# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_08_161444) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "annual_goals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "goal_type", default: 0, null: false
    t.integer "progress_pct", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.date "target_date"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "year", null: false
    t.index ["status"], name: "index_annual_goals_on_status"
    t.index ["year"], name: "index_annual_goals_on_year"
  end

  create_table "certifications", force: :cascade do |t|
    t.decimal "cost", precision: 8, scale: 2
    t.datetime "created_at", null: false
    t.date "exam_date"
    t.date "expiry_date"
    t.string "name", null: false
    t.text "notes"
    t.date "obtained_date"
    t.string "provider"
    t.integer "status", default: 0, null: false
    t.integer "study_progress_pct", default: 0, null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.index ["status"], name: "index_certifications_on_status"
  end

  create_table "monthly_plan_items", force: :cascade do |t|
    t.float "actual_hours", default: 0.0
    t.bigint "annual_goal_id"
    t.datetime "created_at", null: false
    t.text "description"
    t.bigint "monthly_plan_id", null: false
    t.integer "position", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.float "target_hours", default: 0.0
    t.bigint "topic_id", null: false
    t.datetime "updated_at", null: false
    t.index ["annual_goal_id"], name: "index_monthly_plan_items_on_annual_goal_id"
    t.index ["monthly_plan_id"], name: "index_monthly_plan_items_on_monthly_plan_id"
    t.index ["topic_id"], name: "index_monthly_plan_items_on_topic_id"
  end

  create_table "monthly_plans", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "month", null: false
    t.text "notes"
    t.integer "status", default: 0, null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.integer "year", null: false
    t.index ["year", "month"], name: "index_monthly_plans_on_year_and_month", unique: true
  end

  create_table "resources", force: :cascade do |t|
    t.string "author"
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_recommended", default: false, null: false
    t.integer "progress_pct", default: 0, null: false
    t.integer "resource_type", default: 0, null: false
    t.string "title", null: false
    t.bigint "topic_id", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.index ["topic_id"], name: "index_resources_on_topic_id"
  end

  create_table "review_sessions", force: :cascade do |t|
    t.date "completed_date"
    t.datetime "created_at", null: false
    t.float "ease_factor", default: 2.5, null: false
    t.integer "interval_days", default: 1, null: false
    t.text "notes"
    t.integer "quality_rating"
    t.integer "repetition_number", default: 0, null: false
    t.date "scheduled_date", null: false
    t.integer "status", default: 0, null: false
    t.bigint "topic_id", null: false
    t.datetime "updated_at", null: false
    t.index ["scheduled_date"], name: "index_review_sessions_on_scheduled_date"
    t.index ["status"], name: "index_review_sessions_on_status"
    t.index ["topic_id"], name: "index_review_sessions_on_topic_id"
  end

  create_table "study_logs", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.float "hours", null: false
    t.integer "log_type", default: 0, null: false
    t.bigint "monthly_plan_item_id"
    t.text "notes"
    t.bigint "topic_id", null: false
    t.datetime "updated_at", null: false
    t.index ["date"], name: "index_study_logs_on_date"
    t.index ["monthly_plan_item_id"], name: "index_study_logs_on_monthly_plan_item_id"
    t.index ["topic_id"], name: "index_study_logs_on_topic_id"
  end

  create_table "topics", force: :cascade do |t|
    t.integer "category", default: 0, null: false
    t.datetime "created_at", null: false
    t.float "decay_rate", default: 0.05, null: false
    t.text "description"
    t.datetime "last_practiced_at"
    t.string "name", null: false
    t.bigint "parent_topic_id"
    t.integer "proficiency_level", default: 0, null: false
    t.string "subcategory"
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_topics_on_category"
    t.index ["parent_topic_id"], name: "index_topics_on_parent_topic_id"
    t.index ["subcategory"], name: "index_topics_on_subcategory"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "monthly_plan_items", "annual_goals"
  add_foreign_key "monthly_plan_items", "monthly_plans"
  add_foreign_key "monthly_plan_items", "topics"
  add_foreign_key "resources", "topics"
  add_foreign_key "review_sessions", "topics"
  add_foreign_key "study_logs", "monthly_plan_items"
  add_foreign_key "study_logs", "topics"
  add_foreign_key "topics", "topics", column: "parent_topic_id"
end
