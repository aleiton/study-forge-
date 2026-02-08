class CreateStudyLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :study_logs do |t|
      t.references :topic, null: false, foreign_key: true
      t.references :monthly_plan_item, foreign_key: true
      t.date :date, null: false
      t.float :hours, null: false
      t.text :notes
      t.integer :log_type, null: false, default: 0

      t.timestamps
    end

    add_index :study_logs, :date
  end
end
