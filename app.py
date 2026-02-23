from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import CORS to fix frontend fetch issues
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Load trained model and scaler
try:
    model = joblib.load("credit_score_model.pkl")
    scaler = joblib.load("scaler.pkl")
    feature_names = joblib.load("feature_names.pkl")  # Load correct feature order
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/')
def home():
    return jsonify({"message": "Credit Score Prediction API is running!"})

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # ✅ Get query parameters
        annual_revenue = request.args.get('annual_revenue', type=float)
        loan_amount = request.args.get('loan_amount', type=float)
        gst_compliance = request.args.get('gst_compliance', type=float)
        past_defaults = request.args.get('past_defaults', type=int)
        bank_transactions = request.args.get('bank_transactions', type=int)
        market_trend = request.args.get('market_trend', type=int)

        # ✅ Validate all parameters are present
        params = {
            'annual_revenue': annual_revenue,
            'loan_amount': loan_amount,
            'gst_compliance': gst_compliance,
            'past_defaults': past_defaults,
            'bank_transactions': bank_transactions,
            'market_trend': market_trend
        }
        missing = [key for key, value in params.items() if value is None]
        
        if missing:
            return jsonify({
                "error": f"Missing required query parameters: {', '.join(missing)}"
            }), 400

        # Create features array
        input_data = np.array([[annual_revenue, loan_amount, gst_compliance, past_defaults, bank_transactions, market_trend]])

        # ✅ Convert to DataFrame with correct feature names
        input_df = pd.DataFrame(input_data, columns=feature_names)

        # ✅ Scale the input before prediction
        input_scaled = scaler.transform(input_df)

        # ✅ Predict credit score
        predicted_score = model.predict(input_scaled)

        return jsonify({"predicted_credit_score": float(predicted_score[0])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # ✅ Explicitly set port
