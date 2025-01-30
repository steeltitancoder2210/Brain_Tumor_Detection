from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load the trained model
model = tf.keras.models.load_model("bestmodel.keras")

# Function to preprocess the image
def preprocess_image(image):
    image = image.convert("RGB")  # Convert to RGB
    image = image.resize((224, 224))  # Resize to model input shape
    image = np.array(image) / 255.0  # Normalize to [0,1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Prediction API
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["image"]
    image = Image.open(io.BytesIO(file.read()))  # Read the image

    processed_image = preprocess_image(image)  # Preprocess

    prediction = model.predict(processed_image)[0][0]  # Model prediction


    probability = float(prediction) * 100

    return jsonify({"prediction": probability})  # Send response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
