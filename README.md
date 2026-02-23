Credit Score Prediction API

Overview

This API predicts a credit score based on user financial details using a trained machine learning model.

API Endpoints

Check API Status

Endpoint: GET /

Description: Confirms that the API is running.

Example Response:

{
    "message": "Credit Score Prediction API is running!"
}

Predict Credit Score

Endpoint: POST /predict

Description: Sends financial details to the AI model and returns a predicted credit score.

Request Format:

{
    "features": [Annual_Revenue, Loan_Amount, GST_Compliance, Past_Defaults, Bank_Transactions, Market_Trend]
}

Example Input:

{
    "features": [5000000, 500000, 85, 1, 3, 2]
}

Response Format:

{
    "predicted_credit_score": 750.23
}

Example Response:

{
    "predicted_credit_score": 740.5
}

Example API Request Using Postman

Open Postman.

Select the POST method and enter the URL: http://127.0.0.1:5000/predict

Go to the Body section, select raw, and choose JSON format.

Enter the test data:

{
    "features": [4000000, 700000, 90, 2, 2, 1]
}

Click Send and check the predicted score.

Example API Request Using JavaScript (Frontend)

To call the API from a frontend application, use the following JavaScript function:

async function getCreditScore(userData) {
    let response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "features": userData })
    });
    
    let result = await response.json();
    console.log("Predicted Credit Score:", result.predicted_credit_score);
}

Common Errors and Solutions

500 Internal Server Error

Possible Cause: Incorrect data format

Solution: Ensure the JSON request contains a valid features array.

404 Not Found

Possible Cause: The API is not running

Solution: Start the API using the command python app.py.

TypeError: Failed to fetch

Possible Cause: CORS issue when making a request from the frontend

Solution: Install and use flask-cors with the command pip install flask-cors.

How to Run the API

Install the required dependencies by running the following command:

pip install flask joblib pandas numpy xgboost sklearn flask-cors

Start the API by running the following command:

python app.py

Test the API using Postman or by integrating it with a web frontend.

Next Steps

Integrate this API into the chatbot and risk assessment dashboard UI.

Deploy the API on a cloud server for public access.

Improve model accuracy with additional training data.

This API was developed as part of a hackathon project to enhance financial risk assessment and credit scoring.

