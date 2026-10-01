import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

class CropPredictor:
    def __init__(self, model_path=None, pipeline_path=None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        
        if model_path is None:
            model_path = os.path.join(base_dir, 'models', 'crop_recommendation_model.joblib')
        if pipeline_path is None:
            pipeline_path = os.path.join(base_dir, 'preprocessing', 'crop_preprocessing_pipeline.joblib')

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}. Run train_crop_model.py first.")
        if not os.path.exists(pipeline_path):
            raise FileNotFoundError(f"Pipeline file not found at: {pipeline_path}. Run train_crop_model.py first.")

        # Load saved artifacts
        self.model_bundle = joblib.load(model_path)
        self.pipeline = joblib.load(pipeline_path)

        self.model = self.model_bundle['model']
        self.model_name = self.model_bundle['model_name']
        self.requires_scaling = self.model_bundle.get('requires_scaling', False)
        
        self.scaler = self.pipeline['scaler']
        self.label_encoder = self.pipeline['label_encoder']
        self.feature_names = self.pipeline['feature_names']
        self.classes = self.pipeline['classes']

    def predict(self, input_data):
        """
        Predict crop recommendation using EXACT 6 hardware parameters:
        N, P, K, temperature, humidity, ph.
        (rainfall and EC are NOT used).
        """
        if isinstance(input_data, dict):
            for feat in self.feature_names:
                if feat not in input_data:
                    raise ValueError(f"Missing required feature '{feat}' in input dictionary. Expected 6 features: {self.feature_names}")
            features_array = np.array([[float(input_data[feat]) for feat in self.feature_names]])
        elif isinstance(input_data, (list, tuple)):
            if len(input_data) != len(self.feature_names):
                raise ValueError(f"Input list must contain exactly {len(self.feature_names)} features: {self.feature_names}")
            features_array = np.array([input_data], dtype=float)
        elif isinstance(input_data, pd.DataFrame):
            features_array = input_data[self.feature_names].values
        else:
            raise TypeError("input_data must be a dict, list/tuple, or pandas DataFrame.")

        # Apply scaling if required by model
        if self.requires_scaling:
            features_processed = self.scaler.transform(features_array)
        else:
            features_processed = features_array

        # Predict crop label
        pred_encoded = self.model.predict(features_processed)[0]
        predicted_crop = self.label_encoder.inverse_transform([pred_encoded])[0]

        # Probabilities for top recommendations
        probabilities = {}
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(features_processed)[0]
            top_3_indices = np.argsort(probs)[::-1][:3]
            for idx in top_3_indices:
                crop_name = self.label_encoder.inverse_transform([idx])[0]
                probabilities[crop_name] = round(float(probs[idx]), 4)

        return {
            'recommended_crop': predicted_crop,
            'confidence': probabilities.get(predicted_crop, 1.0),
            'top_3_crops': probabilities,
            'input_features': {feat: features_array[0][i] for i, feat in enumerate(self.feature_names)},
            'model_used': self.model_name
        }


def main():
    print("==================================================")
    print("  NUTRISOIL — 6-FEATURE STANDALONE CROP PREDICTOR ")
    print("==================================================")

    predictor = CropPredictor()

    sample_inputs = [
        {
            "name": "Sample 1 — Rice Hardware Profile (N, P, K, Temp, Humidity, pH)",
            "data": {"N": 90, "P": 42, "K": 43, "temperature": 20.87, "humidity": 82.00, "ph": 6.50}
        },
        {
            "name": "Sample 2 — Coffee Hardware Profile (N, P, K, Temp, Humidity, pH)",
            "data": {"N": 107, "P": 21, "K": 35, "temperature": 26.54, "humidity": 52.92, "ph": 6.79}
        },
        {
            "name": "Sample 3 — Apple Hardware Profile (N, P, K, Temp, Humidity, pH)",
            "data": {"N": 24, "P": 128, "K": 196, "temperature": 22.70, "humidity": 92.41, "ph": 5.92}
        }
    ]

    for sample in sample_inputs:
        print(f"\n--- {sample['name']} ---")
        input_data = sample['data']
        for k, v in input_data.items():
            print(f"  {k:<12}: {v}")
        
        result = predictor.predict(input_data)
        
        print(f"  -> Recommended Crop : {result['recommended_crop'].upper()}")
        print(f"  -> Confidence       : {result['confidence']*100:.2f}%")
        print(f"  -> Top 3 Predictions: {result['top_3_crops']}")

    print("\n6-Feature Crop Predictor execution completed successfully.")

if __name__ == '__main__':
    main()
