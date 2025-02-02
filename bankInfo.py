import pandas as pd
import google.generativeai as genai

# Configure Gemini API Key
genai.configure(api_key="AIzaSyDu_Lc__HkwPuhPrkISfEa_JuGgJZJ6vQo")

# Load the CSV file
file_path = "categorized_transactions.csv"  
df = pd.read_csv(file_path)

# Convert DataFrame to a readable string format
csv_text = df.to_string(index=False)

# Send to Gemini
model = genai.GenerativeModel('gemini-1.5-flash')
prompt = f"Analyze this bank transaction data and summarize spending trends:\n\n{csv_text}"
response = model.generate_content(prompt)

print(response.text)
