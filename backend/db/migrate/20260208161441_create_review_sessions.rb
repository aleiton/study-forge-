class CreateReviewSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :review_sessions do |t|
      t.references :topic, null: false, foreign_key: true
      t.date :scheduled_date, null: false
      t.date :completed_date
      t.integer :quality_rating
      t.integer :interval_days, null: false, default: 1
      t.float :ease_factor, null: false, default: 2.5
      t.integer :repetition_number, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.text :notes

      t.timestamps
    end

    add_index :review_sessions, :scheduled_date
    add_index :review_sessions, :status
  end
end
