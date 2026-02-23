import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

# Step 1: Load dataset
file_path = "Credit_Score_Dataset.xlsx"
df = pd.read_excel(file_path)

# Step 2: Convert categorical data to numerical values
bank_mapping = {"Low Volume": 0, "Stable": 1, "High Volume": 2}
market_mapping = {"Declining": 0, "Stable": 1, "Growth": 2}

df["Bank_Transactions"] = df["Bank_Transactions"].map(bank_mapping)
df["Market_Trend"] = df["Market_Trend"].map(market_mapping)

# Step 3: Handle missing values (if any)
df.fillna(df.median(), inplace=True)

# Step 4: Select features (X) and target (y)
X = df.drop(columns=["Business_ID", "Credit_Score"])  # Features
y = df["Credit_Score"]  # Target variable

# Step 5: Normalize numerical features using MinMaxScaler
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Save the scaler to a file so it can be used in API predictions
joblib.dump(scaler, "scaler.pkl")
print("Scaler saved as scaler.pkl")

# Step 6: Split data into training (80%) and testing (20%) sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Save processed data for training
joblib.dump((X_train, X_test, y_train, y_test), "processed_data.pkl")
print("Processed data saved as processed_data.pkl")

# Print feature names for debugging
feature_names = list(X.columns)
print("Feature Names Used During Training:", feature_names)
joblib.dump(feature_names, "feature_names.pkl")  # Save feature names for prediction use

# Print data shapes
print(f"Training Data Shape: {X_train.shape}")
print(f"Testing Data Shape: {X_test.shape}")
