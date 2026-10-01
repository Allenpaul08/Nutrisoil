# NutriSoil — Two-Path Fertilizer Recommendation ML Component

This directory contains the final isolated Machine Learning (ML) implementation for **Fertilizer Recommendation** in the NutriSoil project, implementing a **Two-Path Fertilizer Recommendation Architecture**.

---

## 🏛️ Two-Path Recommendation Architecture

```
ESP32 RS485 Hardware Sensors (Registers 49-65)
        ↓
Live Soil Readings [N, P, K, pH, EC, Temperature, Soil Moisture]
        ↓
Soil Health Score (Derived Display Metric)
        +
Crop Recommendation ML (Finalized 6-Feature Model)
        ↓
Predicted Crop (22 Possible Crop Classes)
        ↓
Crop Compatibility Check (Supported vs Unsupported in Fertilizer Dataset)
       /                                                           \
 [Supported Crop]                                            [Unsupported Crop]
      ↓                                                              ↓
PATH A: Crop-Aware Fertilizer Model                       PATH B: Soil-Only Fertilizer Model
(8 Features: N, P, K, pH, EC, Temp, Moisture + Crop_Type)  (7 Features: N, P, K, pH, EC, Temp, Moisture)
      ↓                                                              ↓
Crop-Targeted Fertilizer Recommendation                   Soil-Nutrient-Based Fertilizer Recommendation
```

---

## 🔍 Crop ML Compatibility Audit & Two-Path Routing

An audit comparing the **22 Crop ML output classes** against the **7 `Crop_Type` classes in `fertilizer_recommendation.csv`** revealed:

- **Supported Crops Present in BOTH (3 crops):** `cotton` / `Cotton`, `maize` / `Maize`, `rice` / `Rice`
- **Fertilizer Dataset Crops absent in Crop ML (4 crops):** `Potato`, `Sugarcane`, `Tomato`, `Wheat`
- **Crop ML Outputs MISSING from Fertilizer Dataset (19 crops):** `apple`, `banana`, `blackgram`, `chickpea`, `coconut`, `coffee`, `grapes`, `jute`, `kidneybeans`, `lentil`, `mango`, `mothbeans`, `mungbean`, `muskmelon`, `orange`, `papaya`, `pigeonpeas`, `pomegranate`, `watermelon`.

### 🛡️ Two-Path Inference Strategy:
1. **Path A — Crop-Aware Model (8 Features):** Used when the predicted crop is one of the supported crop categories (`Cotton`, `Maize`, `Potato`, `Rice`, `Sugarcane`, `Tomato`, `Wheat`). Performs crop-targeted N-P-K recommendation.
2. **Path B — Soil-Only Model (7 Features):** **ACTUALLY TRAINED** on the dataset without `Crop_Type`. Used when the predicted crop is an unsupported crop (e.g. `apple`, `coffee`). Generates a pure **Soil-Nutrient-Based Fertilizer Recommendation** based strictly on live soil chemistry (N, P, K, pH, EC, Temp, Moisture).
3. **No Synthetic Fabrication:** Zero fake training rows or fabricated fertilizer labels were added.
4. **No Silent Cross-Crop Mapping:** Unsupported crops are **NOT** silently mapped to an arbitrary crop.
5. **Transparent Reporting:** The predictor explicitly returns `recommendation_mode` (`"crop-aware"` vs `"soil-only"`), `crop_support_status` (`"supported"` vs `"unsupported"`), and a clear notice explaining the soil-only rationale for unsupported crops.

---

## 🧪 Model Training & Benchmark Evaluation

Both models were trained and benchmarked independently on the dataset split (80% train / 20% test, stratified):

### Benchmark Performance Comparison:

| Path Name | Feature Count | Features Used | Selected Model | Train Acc | Test Acc | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Path A: Crop-Aware** | **8** | Live N, P, K, pH, EC, Temp, Moisture + `Crop_Type` | Random Forest (Balanced) | **99.91%** | **86.75%** | **0.7443** | **0.7340** | **0.7144** | **0.8851** |
| **Path B: Soil-Only** | **7** | Live N, P, K, pH, EC, Temp, Moisture | Random Forest (Balanced) | **99.85%** | **86.55%** | **0.7531** | **0.7301** | **0.7157** | **0.8862** |

---

## 💾 Saved Artifacts in `ml/fertilizer/`

- **Path A Model Artifact:** `ml/fertilizer/models/crop_aware_fertilizer_model.joblib`
- **Path B Model Artifact:** `ml/fertilizer/models/soil_only_fertilizer_model.joblib`
- **Master Bundled Model Artifact:** `ml/fertilizer/models/fertilizer_recommendation_model.joblib`
- **Path A Preprocessor Pipeline:** `ml/fertilizer/preprocessing/crop_aware_preprocessing_pipeline.joblib`
- **Path B Preprocessor Pipeline:** `ml/fertilizer/preprocessing/soil_only_preprocessing_pipeline.joblib`
- **Master Bundled Preprocessor Pipeline:** `ml/fertilizer/preprocessing/fertilizer_preprocessing_pipeline.joblib`
- **Feature Definition Document:** `ml/fertilizer/preprocessing/feature_definition.json`
- **Evaluation Report:** `ml/fertilizer/evaluation/model_evaluation_report.json`

---

## 🚀 How to Execute

### 1. Retrain Two-Path Fertilizer Models
```bash
py ml/fertilizer/training/train_fertilizer_model.py
```

### 2. Standalone Two-Path Prediction Verification
```bash
py ml/fertilizer/training/predict_fertilizer.py
```
