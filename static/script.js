document.addEventListener("DOMContentLoaded", function () {
    fetchAnalysis(); // Load AI financial analysis on page load
});

// Global Chat State
let chatStage = 0;
const chatContainer = document.getElementById('chatContainer');
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');

// Event Listeners for Button Click & Enter Key
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Fetch AI Financial Analysis on Load
function fetchAnalysis() {
    fetch("/get-analysis")
        .then(response => response.json())
        .then(data => {
            appendMessage("🤖 Bot", data.analysis, "bot", true);
            setTimeout(() => askNextQuestion(), 2000); // Delay before next question
        })
        .catch(error => {
            console.error("Error fetching analysis:", error);
            appendMessage("🤖 Bot", "⚠️ Failed to load AI analysis.", "bot");
        });
}

// Send Message to AI and Display Response
async function sendMessage() {
    let text = userInput.value.trim();
    if (!text) return; // Ignore empty input

    appendMessage("😎 You", text, "user"); // Display user input

    try {
        let response = await fetch("/ask-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text + ". Make the output efficient and not too long but full of information" })
        });

        let data = await response.json();
        appendMessage("🤖 Bot", data.response, "bot", true); // Display AI response

    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage("🤖 Bot", "❌ Oops, something went wrong!", "bot");
    }

    // Move to Next Chat Stage
    if (chatStage === 1) {
        fetchBotResponse("📅 When do you want to achieve this goal?", () => {
            chatStage = 2;
        });
    } 
    if (chatStage === 2) {
        fetchBotResponse("🚀 Got it! Now, I have all your financial details and goals. Ask me anything!", () => {
            chatStage = 3; // Free chat mode
        });
    }

    userInput.value = ""; // Clear input field
}

// Append Messages to Chat Box
function appendMessage(sender, message, className, isHTML = false) {
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", className);

    if (isHTML) {
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    } else {
        msgDiv.textContent = `${sender}: ${message}`;
    }

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to latest message
}

// Fetch AI Responses in Guided Chat Mode
function fetchBotResponse(responseText, callback) {
    setTimeout(() => {
        appendMessage("🤖 Bot", responseText, "bot", true);
        if (callback) setTimeout(callback, 2000);
    }, 2000);
}

// Ask Next Question in AI Chat Flow
function askNextQuestion() {
    if (chatStage === 0) {
        fetchBotResponse("💰 What are your financial goals?", () => {
            chatStage += 1;
        });
    }
}
