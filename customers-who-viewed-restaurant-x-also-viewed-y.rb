require 'aws-sdk-personalizeruntime'
require 'csv'

aws_access_key_id = ""
aws_secret_access_key = ""
aws_region = 'ap-southeast-1'

client = Aws::PersonalizeRuntime::Client.new(
  region: aws_region,
  access_key_id: aws_access_key_id,
  secret_access_key: aws_secret_access_key
)

recommender_arn = ''

# Function to get recommendations for a user
def get_recommendations(client, recommender_arn, user_id, item_id)
  begin
    resp = client.get_recommendations(
      recommender_arn: recommender_arn,
      user_id: user_id.to_s,
      item_id: item_id.to_s
    )

    resp.item_list.map { |item| item['item_id'] }
  rescue Aws::PersonalizeRuntime::Errors::ServiceError => e
    puts "An error occurred: #{e.message}"
    []
  end
end

item_ids = Restaurant.active.not_expired.pluck(:id);

# Read the TSV file and generate a CSV file for each row
CSV.foreach('list-data-with-objectId.tsv', headers: true, col_sep: "\t") do |row|
  user_id = row['objectId']
  recommendations = item_ids.sample(100).map do |item_id|
    [
      item_id.to_s,
      get_recommendations(client, recommender_arn, user_id, item_id)
    ]
  end

  # Generate the CSV file name
  email_without_domain = row['Email Address [Required]'].split('@').first
  csv_file_name = "/tmp/#{email_without_domain}.tsv"

  # Write the recommendations to the CSV file
  CSV.open(csv_file_name, 'wb', col_sep: "\t", write_headers: true, headers: ['visited restaurant', 'recommendation']) do |csv|
    recommendations.each do |rec|
      item_id_arg, result = rec
      next if result.blank?

      result = result.map do |item|
        restaurant = Restaurant.find_by(id: item)
        if restaurant
          [restaurant.id, restaurant.name_en].join(' - ')
        end
      end.join("\n")

      csv << [
        "#{item_id_arg} - #{Restaurant.find_by(id: item_id_arg).name_en}",
        result
      ]
    end
  end
  puts "done for #{email_without_domain} ---------------------------"
end

puts "CSV files have been generated."

