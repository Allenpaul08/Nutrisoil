# NutriSoil — 6-Feature Crop Recommendation ML Component

This directory contains the isolated Machine Learning (ML) implementation for **Crop Recommendation** in the NutriSoil project, retrained using **EXACTLY 6 hardware-aligned inputs**.

---

## ⚙️ Hardware Feature Alignment

The model has been retrained specifically to accept **ONLY 6 inputs** that align directly with parameters obtainable from NutriSoil's ESP32 RS485 Modbus hardware:

1. **N** — Nitrogen (`kg/ha`)
2. **P** — Phosphorus (`kg/ha`)
3. **K** — Potassium (`kg/ha`)
4. **temperature** — Temperature (`°C`)
5. **humidity** — Relative Humidity / Soil Moisture proxy (`%`)
6. **ph** — Soil pH value (`pH scale`)

### ❌ Excluded Parameters:
- **`rainfall`**: **COMPLETELY REMOVED** from feature set to align directly with real-time field hardware sensors.
- **`EC`**: **NOT ADDED** (not present in the Kaggle dataset).

---

## 📁 Directory Structure

```
ml/
└── crop/
    ├── dataset/
    │   └── Crop_recommendation.csv        # Approved Kaggle dataset (2,200 rows)
    ├── notebooks/
    │   ├── crop-recommendation-model.ipynb
    │   └── crop-analysis-and-prediction.ipynb
    ├── training/
    │   ├── train_crop_model.py            # Reproducible 6-feature ML training script
    │   └── predict_crop.py                # Standalone 6-feature prediction script
    ├── models/
    │   └── crop_recommendation_model.joblib # Retrained 6-feature model bundle
    ├── preprocessing/
    │   ├── crop_preprocessing_pipeline.joblib # Saved 6-feature scaler & encoder pipeline
    │   └── feature_definition.json        # 6-feature schema definition & order
    ├── evaluation/
    │   └── model_evaluation_report.json   # 6-feature evaluation metrics output
    └── README.md                          # Documentation
```

---

## 📊 Benchmark Evaluation Results (6-Feature Model)

Five supervised classification models were benchmarked on the 6-feature dataset split (80% train / 20% test, stratified):

| Model Name | Train Accuracy | Test Accuracy | Precision (Macro) | Recall (Macro) | F1-Score (Macro) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** ⭐ | **100.00%** | **96.82%** | **0.9691** | **0.9682** | **0.9678** |
| **Gaussian Naive Bayes** | 96.70% | 95.91% | 0.9596 | 0.9591 | 0.9588 |
| **Decision Tree** | 100.00% | 95.68% | 0.9597 | 0.9568 | 0.9569 |
| **Support Vector Classifier (SVC)** | 95.17% | 93.64% | 0.9378 | 0.9364 | 0.9357 |
| **Logistic Regression** | 91.70% | 92.27% | 0.9233 | 0.9227 | 0.9224 |

### Selected Model: **Random Forest Classifier**
- **Test Accuracy:** **96.82%**
- **Macro Precision:** **0.9691**
- **Macro Recall:** **0.9682**
- **Macro F1-Score:** **0.9678**

---

## 🚀 How to Execute

### 1. Retrain 6-Feature Model
```bash
py ml/crop/training/train_crop_model.py
```

### 2. Standalone 6-Feature Predictions
```bash
py ml/crop/training/predict_crop.py
```

### Python Code Example:
```python
from ml.crop.training.predict_crop import CropPredictor

predictor = CropPredictor()
hardware_input = {
    'N': 90,
    'P': 42,
    'K': 43,
    'temperature': 20.87,
    'humidity': 82.00,
    'ph': 6.50
}
result = predictor.predict(hardware_input)
print("Recommended Crop:", result['recommended_crop'])
print("Confidence:", result['confidence'])
```
