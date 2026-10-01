import sys
import os
from flask import Blueprint, request, jsonify

# Ensure project root directory is in Python path for ML module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.crop.training.predict_crop import CropPredictor
from ml.fertilizer.training.predict_fertilizer import FertilizerPredictor

ml_blueprint = Blueprint('ml_api', __name__)

# Initialize predictors once at module load
try:
    crop_predictor = CropPredictor()
    fertilizer_predictor = FertilizerPredictor()
    print("[Flask ML Gateway] CropPredictor and FertilizerPredictor initialized successfully.")
except Exception as e:
    print(f"[Flask ML Gateway Error] Failed to initialize ML predictors: {e}")
    crop_predictor = None
    fertilizer_predictor = None

def parse_float_field(data, field_name, required=True, default=None):
    if field_name not in data or data[field_name] is None or data[field_name] == '':
        if required:
            raise ValueError(f"Missing required field: '{field_name}'")
        return default
    try:
        return float(data[field_name])
    except (ValueError, TypeError):
        raise ValueError(f"Field '{field_name}' must be numeric (received: {data[field_name]})")

@ml_blueprint.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "models": {
            "crop_model": "Random Forest (6 Features)",
            "fertilizer_model": "Two-Path Architecture (Path A Crop-Aware / Path B Soil-Only)"
        }
    }), 200

def handle_crop_prediction(data):
    if not crop_predictor:
        return jsonify({"error": "Crop ML predictor is not initialized"}), 500

    try:
        nitrogen = parse_float_field(data, 'nitrogen', required=False)
        if nitrogen is None:
            nitrogen = parse_float_field(data, 'N', required=True)

        phosphorus = parse_float_field(data, 'phosphorus', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'phosphorous', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'Phosphorus_Level', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'P', required=True)

        potassium = parse_float_field(data, 'potassium', required=False)
        if potassium is None:
            potassium = parse_float_field(data, 'K', required=True)

        temperature = parse_float_field(data, 'temperature', required=True)
        
        moisture = parse_float_field(data, 'moisture', required=False)
        if moisture is None:
            moisture = parse_float_field(data, 'humidity', required=True)

        ph = parse_float_field(data, 'ph', required=True)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    crop_input = {
        "N": nitrogen,
        "P": phosphorus,
        "K": potassium,
        "temperature": temperature,
        "humidity": moisture,
        "ph": ph
    }

    try:
        result = crop_predictor.predict(crop_input)
        # Add response compatibility aliases
        result['crop'] = result.get('recommended_crop')
        result['cropConfidence'] = result.get('confidence')
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Crop prediction runtime error", "details": str(e)}), 500

@ml_blueprint.route('/ml/crop', methods=['POST'])
@ml_blueprint.route('/crop-recommendation', methods=['POST'])
def predict_crop_endpoint():
    data = request.get_json(silent=True) or {}
    return handle_crop_prediction(data)

def handle_fertilizer_prediction(data):
    if not fertilizer_predictor:
        return jsonify({"error": "Fertilizer ML predictor is not initialized"}), 500

    try:
        nitrogen = parse_float_field(data, 'nitrogen', required=False)
        if nitrogen is None:
            nitrogen = parse_float_field(data, 'Nitrogen_Level', required=True)

        phosphorus = parse_float_field(data, 'phosphorus', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'phosphorous', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'Phosphorus_Level', required=True)

        potassium = parse_float_field(data, 'potassium', required=False)
        if potassium is None:
            potassium = parse_float_field(data, 'Potassium_Level', required=True)

        ph = parse_float_field(data, 'ph', required=False)
        if ph is None:
            ph = parse_float_field(data, 'Soil_pH', required=True)

        ec = parse_float_field(data, 'ec', required=False)
        if ec is None:
            ec = parse_float_field(data, 'Electrical_Conductivity', required=True)

        temperature = parse_float_field(data, 'temperature', required=True)

        moisture = parse_float_field(data, 'moisture', required=False)
        if moisture is None:
            moisture = parse_float_field(data, 'Soil_Moisture', required=True)

        crop = str(data.get('crop', data.get('Crop_Type', ''))).strip()

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    fert_input = {
        "Crop_Type": crop,
        "Nitrogen_Level": nitrogen,
        "Phosphorus_Level": phosphorus,
        "Potassium_Level": potassium,
        "Soil_pH": ph,
        "Electrical_Conductivity": ec,
        "Temperature": temperature,
        "Soil_Moisture": moisture
    }

    try:
        result = fertilizer_predictor.predict(fert_input)
        # Add response compatibility aliases
        result['fertilizer'] = result.get('recommended_fertilizer')
        result['fertilizerConfidence'] = result.get('confidence')
        result['fertilizerPath'] = result.get('recommendation_mode')
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Fertilizer prediction runtime error", "details": str(e)}), 500

@ml_blueprint.route('/ml/fertilizer', methods=['POST'])
@ml_blueprint.route('/fertilizer', methods=['POST'])
def predict_fertilizer_endpoint():
    data = request.get_json(silent=True) or {}
    return handle_fertilizer_prediction(data)

@ml_blueprint.route('/ml/analyze', methods=['POST'])
def analyze_endpoint():
    if not crop_predictor or not fertilizer_predictor:
        return jsonify({"error": "ML predictors are not initialized"}), 500

    data = request.get_json(silent=True) or {}

    try:
        nitrogen = parse_float_field(data, 'nitrogen', required=False)
        if nitrogen is None:
            nitrogen = parse_float_field(data, 'N', required=True)

        phosphorus = parse_float_field(data, 'phosphorus', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'phosphorous', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'Phosphorus_Level', required=False)
        if phosphorus is None:
            phosphorus = parse_float_field(data, 'P', required=True)

        potassium = parse_float_field(data, 'potassium', required=False)
        if potassium is None:
            potassium = parse_float_field(data, 'K', required=True)

        ph = parse_float_field(data, 'ph', required=False)
        if ph is None:
            ph = parse_float_field(data, 'Soil_pH', required=True)

        ec = parse_float_field(data, 'ec', required=False)
        if ec is None:
            ec = parse_float_field(data, 'Electrical_Conductivity', required=True)

        temperature = parse_float_field(data, 'temperature', required=True)

        moisture = parse_float_field(data, 'moisture', required=False)
        if moisture is None:
            moisture = parse_float_field(data, 'humidity', required=True)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    crop_input = {
        "N": nitrogen,
        "P": phosphorus,
        "K": potassium,
        "temperature": temperature,
        "humidity": moisture,
        "ph": ph
    }

    try:
        crop_res = crop_predictor.predict(crop_input)
        crop_res['crop'] = crop_res.get('recommended_crop')
        crop_res['cropConfidence'] = crop_res.get('confidence')

        predicted_crop = crop_res.get('recommended_crop', '')

        fert_input = {
            "Crop_Type": predicted_crop,
            "Nitrogen_Level": nitrogen,
            "Phosphorus_Level": phosphorus,
            "Potassium_Level": potassium,
            "Soil_pH": ph,
            "Electrical_Conductivity": ec,
            "Temperature": temperature,
            "Soil_Moisture": moisture
        }

        fert_res = fertilizer_predictor.predict(fert_input)
        fert_res['fertilizer'] = fert_res.get('recommended_fertilizer')
        fert_res['fertilizerConfidence'] = fert_res.get('confidence')
        fert_res['fertilizerPath'] = fert_res.get('recommendation_mode')

        return jsonify({
            "success": True,
            "crop": crop_res,
            "fertilizer": fert_res
        }), 200
    except Exception as e:
        return jsonify({"error": "Soil analysis pipeline execution error", "details": str(e)}), 500
