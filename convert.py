import csv
import json

csv_file = 'discog.csv'
json_file = 'discog.json'

data = []

with open(csv_file, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append(row)

with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Conversion complete! JSON file created.")
