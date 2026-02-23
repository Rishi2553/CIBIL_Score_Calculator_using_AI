import joblib
import xgboost as xgb
import numpy as np
from sklearn.metrics import mean_absolute_error, roc_auc_score, f1_score
from preprocessing import X_train, X_test, y_train, y_test  # Import preprocessed data

# Load MinMaxScaler for consistency
scaler = joblib.load("scaler.pkl")

# Debugging - Check Data Variability
print("Sample y_train:", y_train[:10])  
print("y_train Min:", np.min(y_train), "Max:", np.max(y_train), "Mean:", np.mean(y_train))

# Train the XGBoost Model (Improved Parameters for Better Feature Balance)
print("Training XGBoost model...")
xgb_model = xgb.XGBRegressor(
    objective="reg:squarederror",
    n_estimators=500,  
    learning_rate=0.02,  
    max_depth=10,  
    subsample=0.8,  
    colsample_bytree=0.8  
)
xgb_model.fit(X_train, y_train)
print("Model training complete!")

# Debugging - Check Feature Importance
print("Feature Importance:", xgb_model.feature_importances_)

# Evaluate Model Performance
y_pred = xgb_model.predict(X_test)

# Mean Absolute Error (for regression tasks)
mae = mean_absolute_error(y_test, y_pred)

# ROC-AUC Score (only for classification tasks)
# If y_test contains binary values (0 = Reject, 1 = Approve), use this
try:
    roc_auc = roc_auc_score(y_test, y_pred)  # Only valid for classification
except ValueError:
    roc_auc = "N/A (Not a classification problem)"

# F1-score (only for classification tasks, rounding required)
try:
    f1 = f1_score(y_test, np.round(y_pred), average='weighted')  
except ValueError:
    f1 = "N/A (Not a classification problem)"

# Print the evaluation results
print("Mean Absolute Error (MAE):", mae)
print("ROC-AUC Score:", roc_auc)
print("F1 Score:", f1)

# Save the trained model
joblib.dump(xgb_model, "credit_score_model.pkl")
print("Model saved successfully!")
