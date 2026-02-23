import joblib
import numpy as np
import pandas as pd

# Load the trained model, scaler, and feature names
model = joblib.load("credit_score_model.pkl")
scaler = joblib.load("scaler.pkl")
feature_names = joblib.load("feature_names.pkl")  # Load feature names to match training

print("Model, scaler, and feature names loaded successfully!")

# Example input (Modify values as needed)
new_data = np.array([[60000, 85, 100000, 1, 2, 1]])  # Ensure values match feature order

# Convert input into a DataFrame with correct column names
new_data_df = pd.DataFrame(new_data, columns=feature_names)

# Scale the input before prediction
new_data_scaled = scaler.transform(new_data_df)

# Predict credit score
predicted_score = model.predict(new_data_scaled)

print(f"Predicted Credit Score: {predicted_score[0]:.2f}")
