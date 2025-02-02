document.addEventListener("DOMContentLoaded", function () {
    fetchAnalysis(); // Load initial AI analysis on page load
});

let chatStage = 0; // Controls chatbot flow

function fetchAnalysis() {
    fetch("/get-analysis")
        .then(response => response.json())
        .then(data => {
            appendMessage("🤖 Bot", data.analysis, "bot-message", true);
            setTimeout(() => askNextQuestion(), 2000); // Delay before next question
        })
        .catch(error => {
            console.error("Error fetching analysis:", error);
            appendMessage("🤖 Bot", "⚠️ Failed to load AI analysis.", "bot-message");
        });
}

async function sendMessage() {
    let userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return; // Ignore empty input

    appendMessage("😎 You", userInput, "user-message"); // Display user input

    try {
        // Wait for fetch() to complete before proceeding
        let response = await fetch("/ask-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput+". Make the output efficient and not too long but full of information" })
        });

        let data = await response.json(); // Wait for JSON conversion
        appendMessage("🤖 Bot", data.response, "bot-message", true); // Display bot response

    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage("🤖 Bot", "❌ Oops, something went wrong!", "bot-message");
    }

    if (chatStage === 1) {
        // If user responded to "What are your financial goals?"
        fetchBotResponse("📅 When do you want to achieve this goal?", () => {
            chatStage = 2; // Move to next stage
        });
    } 
    if (chatStage === 2) {
        // If user responded to "When do you want to achieve the goal?"
        fetchBotResponse("🚀 Got it! Now, I have all your financial details and goals. Ask me anything!", () => {
            chatStage = 3; // Free chat mode
        });
    }

    document.getElementById("userInput").value = ""; // Clear input field
}

function openChatbot() {
    fetch('/open_chat')  // Calls the Python backend
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.open(data.url, '_blank'); // Open chatbot in a new tab
        } else {
            alert('Failed to open chat.');
        }
    })
    .catch(error => console.error('Error:', error));
}


// function sendMessage() {
//     let userInput = document.getElementById("userInput").value.trim();
//     if (!userInput) return; // Ignore empty input

//     appendMessage("😎 You", userInput, "user-message"); // Show user's message

//     // Free chat mode (just respond, no more pre-programmed questions)
//     fetch("/ask-question", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: userInput })
//     })
//     .then(response => response.json())
//     .then(data => {
//         appendMessage("🤖 Bot", data.response, "bot-message");
//     })
//     .catch(error => {
//         console.error("Error sending message:", error);
//         appendMessage("🤖 Bot", "❌ Oops, something went wrong!", "bot-message");
//     });

    

//     document.getElementById("userInput").value = ""; // Clear input field
// }

function fetchBotResponse(responseText, callback) {
    setTimeout(() => {
        appendMessage("🤖 Bot", responseText, "bot-message", true);
        if (callback) setTimeout(callback, 2000); // Delay next question for natural feel
    }, 2000);
}

function askNextQuestion() {
    if (chatStage === 0) {
        fetchBotResponse("💰 What are your financial goals?", () => {
            chatStage += 1; // Move to next stage
        });
    }
}

function appendMessage(sender, message, className, isHTML = false) {
    let chatbox = document.getElementById("messages");
    let msgDiv = document.createElement("div");
    msgDiv.className = className;

    if (isHTML) {
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`; // Render as HTML
    } else {
        msgDiv.innerText = `${sender}: ${message}`; // Plain text (for user)
    }

    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to latest message
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}
