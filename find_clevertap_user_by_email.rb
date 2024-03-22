require 'csv'
require 'net/http'
require 'uri'
require 'json'

ACCOUNT_ID = "XXX"
PASSCODE = "XXX"

def fetch_object_id(email)
  uri = URI.parse("https://api.clevertap.com/1/profile.json?email=#{email}")
  request = Net::HTTP::Get.new(uri)
  request.content_type = "application/json"
  request["X-Clevertap-Account-Id"] = ACCOUNT_ID
  request["X-Clevertap-Passcode"] = PASSCODE

  req_options = {
    use_ssl: uri.scheme == "https",
  }

  response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
    http.request(request)
  end

  if response.code == '200'
    json_response = JSON.parse(response.body)
    if json_response["status"] == "success" && json_response["record"].present?
      # Assuming the first platformInfo contains the desired objectId
      return json_response["record"]["platformInfo"][0]["objectId"]
    end
  end

  nil
rescue => e
  binding.pry
  raise e
end

# Read the original TSV file and write to a new file with objectId
CSV.open('list-data-with-objectId.tsv', 'wb', col_sep: "\t") do |csv_out|
  csv_out << ["First Name [Required]", "Last Name [Required]", "Email Address [Required]", "Last Sign In [READ ONLY]", "objectId"]

  CSV.foreach('list-data.tsv', headers: true, col_sep: "\t") do |row|
    email = row["Email Address [Required]"]
    object_id = fetch_object_id(email)
    csv_out << row.fields + [object_id]
  end
end

puts "Completed adding objectId to list-data-with-objectId.tsv"

