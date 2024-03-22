require 'aws-sdk-personalizeruntime'

aws_access_key_id = ""
aws_secret_access_key = ""
aws_region = 'ap-southeast-1'

client = Aws::PersonalizeRuntime::Client.new(
  region: aws_region,
  access_key_id: aws_access_key_id,
  secret_access_key: aws_secret_access_key
)

# The recommender ARN
recommender_arn = ''

# Function to get recommendations for a user
def get_recommendations(client, recommender_arn, user_id)
  begin
    response = client.get_recommendations(
      recommender_arn: recommender_arn,
      user_id: user_id
    )
    response.item_list.map do |item|
      item['item_id']
    end
  rescue Aws::PersonalizeRuntime::Errors::ServiceError => e
    puts "An error occurred: #{e.message}"
  end
end

updated_rows = []
CSV.foreach('list-data-with-objectId.tsv', headers: true, col_sep: "\t") do |row|
  user_id = row['objectId']
  result = get_recommendations(client, recommender_arn, user_id);
  next if result.blank?
  item_ids = result.map do |item|
    restaurant = Restaurant.find_by(id: item['item_id'])
    if restaurant
      [restaurant.id, restaurant.name_en].join(' - ')
    end
  end.join("\n")
  row['item ids'] = item_ids
  updated_rows << row
end

CSV.open('list-data-with-item-ids.tsv', 'wb', col_sep: "\t", write_headers: true, headers: updated_rows.first.headers) do |csv|
  updated_rows.each do |row|
    csv << row
  end
end
