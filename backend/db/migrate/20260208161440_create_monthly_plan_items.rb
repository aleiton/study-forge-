class CreateMonthlyPlanItems < ActiveRecord::Migration[8.1]
  def change
    create_table :monthly_plan_items do |t|
      t.references :monthly_plan, null: false, foreign_key: true
      t.references :topic, null: false, foreign_key: true
      t.references :annual_goal, foreign_key: true
      t.text :description
      t.float :target_hours, default: 0
      t.float :actual_hours, default: 0
      t.integer :status, null: false, default: 0
      t.integer :position, null: false, default: 0

      t.timestamps
    end
  end
end
