let step = 0;
let userData = {};
const questions = [
    "Enter your Company Name:",
    "Enter Annual Revenue (in ₹):",
    "Enter Loan Amount Required (in ₹):",
    "Enter GST Compliance (%):",
    "Enter Past Defaults (0 for none, else number):",
    "Enter Bank Transactions (0 - Low, 1 - Medium, 2 - High):",
    "Enter Market Trend (0 - Declining, 1 - Stable, 2 - Growth):"
];

window.onload = function () {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;
};

document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    let input = document.getElementById("user-input").value.trim();
    let chatBox = document.getElementById("chat-box");

    if (input === "") return;

    chatBox.innerHTML += `<p class="user-message"><strong>You:</strong> ${input}</p>`;
    document.getElementById("user-input").value = "";

    if (!validateInput(input, step)) {
        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Invalid input. ${questions[step]}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
    }

    storeUserData(input, step);
    step++;

    if (step < questions.length) {
        setTimeout(() => {
            chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    } else {
        await fetchCreditScore();
    }
}

function validateInput(input, step) {
    if (step === 0) return input.length > 0;
    if (step === 1 || step === 2) return !isNaN(input) && input > 0;
    if (step === 3) return !isNaN(input) && input >= 0 && input <= 100;
    if (step === 4) return !isNaN(input) && input >= 0;
    if (step === 5 || step === 6) return [0, 1, 2].includes(parseInt(input));
    return true;
}

function storeUserData(input, step) {
    const keys = ["company_name", "annual_revenue", "loan_amount", "gst_compliance", "past_defaults", "bank_transactions", "market_trend"];
    userData[keys[step]] = isNaN(input) ? input : parseFloat(input);
}

async function fetchCreditScore() {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Calculating your CIBIL score...</p>`;

    let testData = {
        "features": [
            userData.annual_revenue,
            userData.loan_amount,
            userData.gst_compliance,
            userData.past_defaults,
            userData.bank_transactions,
            userData.market_trend
        ]
    };

    try {
        // Build URL with query parameters
        let url = `http://127.0.0.1:5000/predict?annual_revenue=${userData.annual_revenue}&loan_amount=${userData.loan_amount}&gst_compliance=${userData.gst_compliance}&past_defaults=${userData.past_defaults}&bank_transactions=${userData.bank_transactions}&market_trend=${userData.market_trend}`;
        
        let response = await fetch(url, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let result = await response.json();
        let score = Math.round(result.predicted_credit_score);

        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Predicted Credit Score: ${score}</p>`;
        updateDashboard(score);
    } catch (error) {
        console.error("Fetch error:", error);
        chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> Error fetching score. Check console for details.</p>`;
    }
}

function drawSpeedometer(score) {
    let canvas = document.getElementById("speedometer");
    let ctx = canvas.getContext("2d");

    let minScore = 300;
    let maxScore = 900;
    let angle = ((score - minScore) / (maxScore - minScore)) * Math.PI - Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semicircle
    ctx.beginPath();
    ctx.arc(150, 150, 100, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // Draw needle
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 90 * Math.cos(angle), 150 + 90 * Math.sin(angle));
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    ctx.stroke();

    // Draw score text
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 110, 140);
}

function updateDashboard(score) {
    let scoreElement = document.getElementById("credit-score");
    let riskLevelElement = document.getElementById("risk-level");

    scoreElement.innerText = `Credit Score: ${score}`;

    if (score >= 750) {
        riskLevelElement.innerText = "Risk Level: Low";
        riskLevelElement.className = "risk-level low-risk";
    } else if (score >= 500) {
        riskLevelElement.innerText = "Risk Level: Medium";
        riskLevelElement.className = "risk-level medium-risk";
    } else {
        riskLevelElement.innerText = "Risk Level: High";
        riskLevelElement.className = "risk-level high-risk";
    }

    drawSpeedometer(score);
}

function resetChat() {
    document.getElementById("chat-box").innerHTML = "";
    document.getElementById("credit-score").innerText = "Credit Score: --";
    document.getElementById("risk-level").innerText = "Risk Level: --";
    step = 0;
    userData = {};

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;

    let canvas = document.getElementById("speedometer");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
