class CreateCertifications < ActiveRecord::Migration[8.1]
  def change
    create_table :certifications do |t|
      t.string :name, null: false
      t.string :provider
      t.integer :status, null: false, default: 0
      t.date :exam_date
      t.date :obtained_date
      t.date :expiry_date
      t.integer :study_progress_pct, null: false, default: 0
      t.decimal :cost, precision: 8, scale: 2
      t.text :notes
      t.string :url

      t.timestamps
    end

    add_index :certifications, :status
  end
end
