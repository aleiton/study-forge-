class CreateTopics < ActiveRecord::Migration[8.1]
  def change
    create_table :topics do |t|
      t.string :name, null: false
      t.integer :category, null: false, default: 0
      t.string :subcategory
      t.text :description
      t.bigint :parent_topic_id
      t.float :decay_rate, null: false, default: 0.05
      t.datetime :last_practiced_at
      t.integer :proficiency_level, null: false, default: 0

      t.timestamps
    end

    add_index :topics, :category
    add_index :topics, :subcategory
    add_index :topics, :parent_topic_id
    add_foreign_key :topics, :topics, column: :parent_topic_id
  end
end
