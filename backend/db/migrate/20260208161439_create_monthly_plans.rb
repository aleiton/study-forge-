class CreateMonthlyPlans < ActiveRecord::Migration[8.1]
  def change
    create_table :monthly_plans do |t|
      t.integer :year, null: false
      t.integer :month, null: false
      t.string :title
      t.text :notes
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :monthly_plans, [:year, :month], unique: true
  end
end
