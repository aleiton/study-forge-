class CreateAnnualGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :annual_goals do |t|
      t.integer :year, null: false
      t.string :title, null: false
      t.text :description
      t.integer :goal_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.date :target_date
      t.integer :progress_pct, null: false, default: 0

      t.timestamps
    end

    add_index :annual_goals, :year
    add_index :annual_goals, :status
  end
end
