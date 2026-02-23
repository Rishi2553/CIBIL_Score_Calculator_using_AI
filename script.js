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
    chatBox.innerHTML += `<p class="bot-message">${questions[step]}</p>`;
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

    chatBox.innerHTML += `<p class="user-message">${input}</p>`;
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
    const canvas = document.getElementById("speedometer");
    const ctx = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height - 10;
    const radius = 65;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ---- Colored arcs ----
    function drawArc(color, start, end) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, end);
        ctx.lineWidth = 18;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    // Green (Low)
    drawArc("#2ecc71", Math.PI, Math.PI * 1.33);

    // Yellow (Medium)
    drawArc("#f1c40f", Math.PI * 1.33, Math.PI * 1.66);

    // Red (High)<canvas id="speedometer" width="400" height="250"></canvas>
    drawArc("#e74c3c", Math.PI * 1.66, Math.PI * 2);

    // ---- Needle ----
    const minScore = 300;
    const maxScore = 900;
    const angle =
        Math.PI + ((score - minScore) / (maxScore - minScore)) * Math.PI;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
        cx + radius * 0.85 * Math.cos(angle),
        cy + radius * 0.85 * Math.sin(angle)
    );
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Needle center
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    // ---- Labels ----
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";

    ctx.fillText("LOW", cx - 95, cy - 20);
    ctx.fillText("MEDIUM", cx - 20, cy - 105);
    ctx.fillText("HIGH", cx + 60, cy - 20);

    // Score text
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, cx - 35, cy + 30);
}

function updateDashboard(score) {
    let scoreElement = document.getElementById("credit-score");
    let riskLevelElement = document.getElementById("risk-level");
    let explanationElement = document.getElementById("risk-explanation");

    scoreElement.innerText = `Credit Score: ${score}`;

    // Analyze user's data to provide insights
    let explanation = generateRiskExplanation(score, userData);

    if (score >= 750) {
        riskLevelElement.innerText = "Risk Level: Low ✅";
        riskLevelElement.className = "risk-level low-risk";
    } else if (score >= 500) {
        riskLevelElement.innerText = "Risk Level: Medium ⚠️";
        riskLevelElement.className = "risk-level medium-risk";
    } else {
        riskLevelElement.innerText = "Risk Level: High ⛔";
        riskLevelElement.className = "risk-level high-risk";
    }

    explanationElement.innerHTML = explanation;
    drawSpeedometer(score);
}

function generateRiskExplanation(score, data) {
    let reasons = [];
    let improvements = [];

    // Analyze Annual Revenue
    if (data.annual_revenue >= 5000000) {
        reasons.push("✅ Strong annual revenue");
    } else if (data.annual_revenue >= 2000000) {
        reasons.push("⚠️ Moderate annual revenue");
        improvements.push("Increase revenue through business growth");
    } else {
        reasons.push("⛔ Low annual revenue");
        improvements.push("Focus on increasing revenue streams");
    }

    // Analyze Loan Amount vs Revenue ratio
    let loanRatio = (data.loan_amount / data.annual_revenue) * 100;
    if (loanRatio <= 20) {
        reasons.push("✅ Low loan-to-revenue ratio (" + loanRatio.toFixed(1) + "%%)");
    } else if (loanRatio <= 50) {
        reasons.push("⚠️ Moderate loan-to-revenue ratio (" + loanRatio.toFixed(1) + "%%)");
        improvements.push("Reduce loan amount or increase revenue");
    } else {
        reasons.push("⛔ High loan-to-revenue ratio (" + loanRatio.toFixed(1) + "%%)");
        improvements.push("Loan amount too high relative to revenue");
    }

    // Analyze GST Compliance
    if (data.gst_compliance >= 90) {
        reasons.push("✅ Excellent GST compliance (" + data.gst_compliance + "%%)");
    } else if (data.gst_compliance >= 70) {
        reasons.push("⚠️ Good GST compliance (" + data.gst_compliance + "%%)");
        improvements.push("Aim for 90%+ GST compliance");
    } else {
        reasons.push("⛔ Low GST compliance (" + data.gst_compliance + "%%)");
        improvements.push("Improve GST compliance to 90%+");
    }

    // Analyze Past Defaults
    if (data.past_defaults === 0) {
        reasons.push("✅ No past defaults");
    } else if (data.past_defaults <= 2) {
        reasons.push("⚠️ " + data.past_defaults + " past default(s)");
        improvements.push("Clear existing defaults and maintain timely payments");
    } else {
        reasons.push("⛔ Multiple past defaults (" + data.past_defaults + ")");
        improvements.push("Urgent: Clear all defaults and rebuild payment history");
    }

    // Analyze Bank Transactions
    const bankLabels = ["Low", "Medium", "High"];
    if (data.bank_transactions === 2) {
        reasons.push("✅ High volume bank transactions");
    } else if (data.bank_transactions === 1) {
        reasons.push("⚠️ Medium volume bank transactions");
        improvements.push("Increase business transaction activity");
    } else {
        reasons.push("⛔ Low volume bank transactions");
        improvements.push("Increase transaction volume for better cash flow tracking");
    }

    // Analyze Market Trend
    const trendLabels = ["Declining", "Stable", "Growth"];
    if (data.market_trend === 2) {
        reasons.push("✅ Operating in growth market");
    } else if (data.market_trend === 1) {
        reasons.push("⚠️ Operating in stable market");
        improvements.push("Explore growth opportunities or market expansion");
    } else {
        reasons.push("⛔ Operating in declining market");
        improvements.push("Consider market diversification or pivot strategy");
    }

    // Build explanation HTML
    let html = "<div class='explanation-content'>";
    
    if (score >= 750) {
        html += "<h4>🎉 Excellent Credit Profile!</h4>";
        html += "<p><strong>Why Low Risk:</strong></p>";
    } else if (score >= 500) {
        html += "<h4>📊 Room for Improvement</h4>";
        html += "<p><strong>Why Medium Risk:</strong></p>";
    } else {
        html += "<h4>⚠️ High Risk Factors</h4>";
        html += "<p><strong>Why High Risk:</strong></p>";
    }

    html += "<ul>";
    reasons.forEach(reason => {
        html += `<li>${reason}</li>`;
    });
    html += "</ul>";

    if (improvements.length > 0) {
        html += "<p><strong>💡 How to Improve:</strong></p><ul>";
        improvements.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += "</ul>";
    } else {
        html += "<p><strong>💪 Keep it up!</strong> Maintain your excellent financial habits.</p>";
    }

    html += "</div>";
    return html;
}

function resetChat() {
    document.getElementById("chat-box").innerHTML = "";
    document.getElementById("credit-score").innerText = "Credit Score: --";
    document.getElementById("risk-level").innerText = "Risk Level: --";
    document.getElementById("risk-explanation").innerHTML = "";
    step = 0;
    userData = {};

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p class="bot-message"><strong>Bot:</strong> ${questions[step]}</p>`;

    let canvas = document.getElementById("speedometer");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
