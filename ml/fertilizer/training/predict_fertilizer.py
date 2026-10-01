import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

class FertilizerPredictor:
    def __init__(self, master_model_path=None, master_pipeline_path=None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        
        if master_model_path is None:
            master_model_path = os.path.join(base_dir, 'models', 'fertilizer_recommendation_model.joblib')
        if master_pipeline_path is None:
            master_pipeline_path = os.path.join(base_dir, 'preprocessing', 'fertilizer_preprocessing_pipeline.joblib')

        if not os.path.exists(master_model_path) or not os.path.exists(master_pipeline_path):
            raise FileNotFoundError("Master model/pipeline files not found. Run train_fertilizer_model.py first.")

        # Load master artifact bundles
        self.master_models = joblib.load(master_model_path)
        self.master_prep = joblib.load(master_pipeline_path)

        self.label_encoder = self.master_prep['label_encoder']
        self.classes = self.master_prep['classes']
        self.dataset_crops = self.master_prep['dataset_crops']
        self.dataset_crops_lower = {c.lower(): c for c in self.dataset_crops}

    def predict(self, input_data):
        """
        Two-Path Fertilizer Inference Engine:
        1. Checks Crop ML prediction against supported fertilizer dataset crops.
        2. If supported -> Route to PATH A (Crop-Aware Model, 8 features).
        3. If unsupported -> Route to PATH B (Soil-Only Model, 7 features).
        """
        if not isinstance(input_data, dict):
            raise TypeError("input_data must be a dictionary containing live sensor readings and Crop ML output.")

        # Required 7 live sensor parameters
        live_sensor_features = [
            'Nitrogen_Level', 'Phosphorus_Level', 'Potassium_Level',
            'Soil_pH', 'Electrical_Conductivity', 'Temperature', 'Soil_Moisture'
        ]

        for feat in live_sensor_features:
            if feat not in input_data:
                raise ValueError(f"Missing required live hardware parameter '{feat}'.")

        input_crop = str(input_data.get('Crop_Type', '')).strip()
        crop_lower = input_crop.lower()

        # Check crop compatibility
        if crop_lower in self.dataset_crops_lower:
            # =========================================================================
            # PATH A: CROP-AWARE FERTILIZER RECOMMENDATION
            # =========================================================================
            recommendation_mode = "crop-aware"
            crop_support_status = "supported"
            matched_crop_name = self.dataset_crops_lower[crop_lower]
            description = f"Crop-Aware Fertilizer Recommendation (Targeted for {matched_crop_name})"
            notice = None

            model_obj = self.master_models['path_a_crop_aware']['model']
            preprocessor = self.master_prep['path_a_crop_aware']['preprocessor']
            selected_features = self.master_prep['path_a_crop_aware']['selected_features']

            df_input = pd.DataFrame([{
                'Nitrogen_Level': float(input_data['Nitrogen_Level']),
                'Phosphorus_Level': float(input_data['Phosphorus_Level']),
                'Potassium_Level': float(input_data['Potassium_Level']),
                'Soil_pH': float(input_data['Soil_pH']),
                'Electrical_Conductivity': float(input_data['Electrical_Conductivity']),
                'Temperature': float(input_data['Temperature']),
                'Soil_Moisture': float(input_data['Soil_Moisture']),
                'Crop_Type': matched_crop_name
            }])[selected_features]

            X_trans = preprocessor.transform(df_input)

        else:
            # =========================================================================
            # PATH B: SOIL-ONLY FERTILIZER RECOMMENDATION
            # =========================================================================
            recommendation_mode = "soil-only"
            crop_support_status = "unsupported"
            matched_crop_name = input_crop
            description = "Soil-Nutrient-Based Fertilizer Recommendation (Soil-Only Model)"
            notice = f"Notice: Crop ML output '{input_crop}' is not represented in the fertilizer dataset. Recommendation was generated using the Soil-Only Fertilizer Model (Path B) based strictly on live soil chemistry (N-P-K-pH-EC-Temp-Moisture)."

            model_obj = self.master_models['path_b_soil_only']['model']
            preprocessor = self.master_prep['path_b_soil_only']['preprocessor']
            selected_features = self.master_prep['path_b_soil_only']['selected_features']

            df_input = pd.DataFrame([{
                'Nitrogen_Level': float(input_data['Nitrogen_Level']),
                'Phosphorus_Level': float(input_data['Phosphorus_Level']),
                'Potassium_Level': float(input_data['Potassium_Level']),
                'Soil_pH': float(input_data['Soil_pH']),
                'Electrical_Conductivity': float(input_data['Electrical_Conductivity']),
                'Temperature': float(input_data['Temperature']),
                'Soil_Moisture': float(input_data['Soil_Moisture'])
            }])[selected_features]

            X_trans = preprocessor.transform(df_input)

        # Inference Prediction
        pred_encoded = model_obj.predict(X_trans)[0]
        recommended_fertilizer = self.label_encoder.inverse_transform([pred_encoded])[0]

        # Probabilities calculation
        probabilities = {}
        if hasattr(model_obj, "predict_proba"):
            probs = model_obj.predict_proba(X_trans)[0]
            top_indices = np.argsort(probs)[::-1][:3]
            for idx in top_indices:
                fert_name = self.label_encoder.inverse_transform([idx])[0]
                probabilities[fert_name] = round(float(probs[idx]), 4)

        return {
            'recommendation_mode': recommendation_mode,
            'crop_support_status': crop_support_status,
            'crop_ml_input': input_crop,
            'recommended_fertilizer': recommended_fertilizer,
            'confidence': probabilities.get(recommended_fertilizer, 1.0),
            'top_3_recommendations': probabilities,
            'description': description,
            'notice': notice,
            'input_features_used': df_input.iloc[0].to_dict()
        }


def main():
    print("==================================================")
    print(" NUTRISOIL — TWO-PATH FERTILIZER PREDICTOR        ")
    print("==================================================")

    predictor = FertilizerPredictor()

    sample_inputs = [
        {
            "name": "Sample 1 — RICE (Supported Crop ML Output) -> PATH A: CROP-AWARE",
            "data": {
                "Crop_Type": "Rice",              # Supported in fertilizer dataset
                "Nitrogen_Level": 90,             # Live RS485 Reg 49
                "Phosphorus_Level": 15,           # Live RS485 Reg 50
                "Potassium_Level": 65,            # Live RS485 Reg 51
                "Soil_pH": 6.8,                   # Live RS485 Reg 52
                "Electrical_Conductivity": 1.5,   # Live RS485 Reg 53
                "Temperature": 24.0,              # Live RS485 Reg 65
                "Soil_Moisture": 40.0             # Live RS485 Reg 55
            }
        },
        {
            "name": "Sample 2 — APPLE (Unsupported Crop ML Output) -> PATH B: SOIL-ONLY",
            "data": {
                "Crop_Type": "apple",             # Unsupported in fertilizer dataset
                "Nitrogen_Level": 25,             # Live RS485 Reg 49
                "Phosphorus_Level": 45,           # Live RS485 Reg 50
                "Potassium_Level": 60,            # Live RS485 Reg 51
                "Soil_pH": 6.2,                   # Live RS485 Reg 52
                "Electrical_Conductivity": 1.2,   # Live RS485 Reg 53
                "Temperature": 26.5,              # Live RS485 Reg 65
                "Soil_Moisture": 35.0             # Live RS485 Reg 55
            }
        },
        {
            "name": "Sample 3 — COFFEE (Unsupported Crop ML Output) -> PATH B: SOIL-ONLY",
            "data": {
                "Crop_Type": "coffee",            # Unsupported in fertilizer dataset
                "Nitrogen_Level": 95,             # Live RS485 Reg 49
                "Phosphorus_Level": 50,           # Live RS485 Reg 50
                "Potassium_Level": 12,            # Live RS485 Reg 51
                "Soil_pH": 6.0,                   # Live RS485 Reg 52
                "Electrical_Conductivity": 1.8,   # Live RS485 Reg 53
                "Temperature": 28.0,              # Live RS485 Reg 65
                "Soil_Moisture": 30.0             # Live RS485 Reg 55
            }
        }
    ]

    for sample in sample_inputs:
        print(f"\n--- {sample['name']} ---")
        res = predictor.predict(sample['data'])
        print(f"  -> Mode                   : {res['recommendation_mode'].upper()} ({res['crop_support_status']})")
        print(f"  -> Recommended Fertilizer : {res['recommended_fertilizer']}")
        print(f"  -> Confidence             : {res['confidence']*100:.2f}%")
        print(f"  -> Description            : {res['description']}")
        if res['notice']:
            print(f"  -> {res['notice']}")
        print(f"  -> Top 3 Predictions      : {res['top_3_recommendations']}")

    print("\nTwo-Path Fertilizer Predictor execution completed successfully.")

if __name__ == '__main__':
    main()
