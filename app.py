from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import requests
import google.generativeai as genai
from io import StringIO
import json
import re
import markdown
import webbrowser

# Configure Flask app
app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key="AIzaSyDu_Lc__HkwPuhPrkISfEa_JuGgJZJ6vQo")

# Google Drive CSV File
file_id = "1rm4gLglPe2oaXXJIEbQgHvBBnlO_80Wt"
drive_url = f"https://drive.google.com/uc?id={file_id}&export=download"

# Load CSV Data
response = requests.get(drive_url)
if response.status_code == 200:
    csv_data = StringIO(response.text)  
    df = pd.read_csv(csv_data)
else:
    df = pd.DataFrame()

# Store conversation history
conversation_history = []

def clean_ai_response(text):
    """Removes special characters like *, _, #, ` from AI-generated text."""
    text = text.strip()
    html_response = markdown.markdown(text)  # Convert Markdown to HTML
    return html_response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-analysis', methods=['GET'])
def get_analysis():
    if df.empty:
        return jsonify({"error": "Failed to load CSV file"})

    # Prepare the prompt for AI analysis
    csv_text = df.to_string(index=False)
    prompt = f"""
    Analyze this bank transaction data and summarize spending trends. 
    Give me a formated list of categories and totals for each.
    My monthly income is 4000, and suggest how I am doing financially 
    and what improvements can be made. Also you are the financial advisor, so do not ask give vage responses
    Give particualr exact step for user in thier responses and do the stuff yourself, like calcualtion and all.
    And use it to give good efficient response. you are like their secretary.:
    {csv_text}
    """

    # Generate AI response
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    clean_response = clean_ai_response(response.text)
    return jsonify({"analysis": clean_response})

@app.route('/ask-question', methods=['POST'])
def ask_question():
    data = request.json
    user_input = data.get("message", "")

    # Maintain chat history
    conversation_history.append(f"User: {user_input} + keep it strictly related to finance and not like a chat GPT, and use as much as numbers possible to give the logic for the response you generate.")

    # Generate AI response
    model = genai.GenerativeModel('gemini-1.5-flash')
    chat_prompt = "\n".join(conversation_history) + "\nBot:"
    response = model.generate_content(chat_prompt)
    clean_response = clean_ai_response(response.text)
    bot_reply = clean_response
    conversation_history.append(f"Bot: {bot_reply}")

    return jsonify({"response": bot_reply})

# **Move this route ABOVE `if __name__ == '__main__':`**
@app.route('/open_chat', methods=['GET'])
def open_chat():
    url = "http://127.0.0.1:5000/"  # Change this if your chatbot runs on a different port
    webbrowser.open(url, new=2)  # Open in a new browser tab
    return jsonify({"success": True, "url": url})

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
