class CreateResources < ActiveRecord::Migration[8.1]
  def change
    create_table :resources do |t|
      t.references :topic, null: false, foreign_key: true
      t.string :title, null: false
      t.integer :resource_type, null: false, default: 0
      t.string :url
      t.string :author
      t.text :description
      t.boolean :is_recommended, null: false, default: false
      t.integer :progress_pct, null: false, default: 0

      t.timestamps
    end
  end
end
