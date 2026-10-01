import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_and_evaluate():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset_path = os.path.join(base_dir, 'dataset', 'Crop_recommendation.csv')
    models_dir = os.path.join(base_dir, 'models')
    prep_dir = os.path.join(base_dir, 'preprocessing')
    eval_dir = os.path.join(base_dir, 'evaluation')

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(prep_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    print("==================================================")
    print(" NUTRISOIL — 6-FEATURE CROP RE-TRAINING PIPELINE  ")
    print("==================================================")
    print(f"Loading dataset from: {dataset_path}")

    # Load dataset
    df = pd.read_csv(dataset_path)
    print(f"Dataset Loaded. Total Rows: {len(df)}, Total Columns: {len(df.columns)}")

    # EXACT 6 features requested (excluding rainfall & EC completely)
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph']
    target_col = 'label'

    print(f"Features Used ({len(feature_cols)}): {feature_cols}")
    print("CONFIRMATION: 'rainfall' has been COMPLETELY REMOVED from the feature set.")
    print("CONFIRMATION: 'EC' is NOT present in dataset and NOT added.")

    X = df[feature_cols].copy()
    y_raw = df[target_col].copy()

    # Target Label Encoding
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    class_names = list(label_encoder.classes_)
    print(f"Target Classes ({len(class_names)} total): {class_names}")

    # Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Fit Scaler ONLY on Training Data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save Preprocessing Pipeline
    pipeline_obj = {
        'scaler': scaler,
        'label_encoder': label_encoder,
        'feature_names': feature_cols,
        'classes': class_names,
        'num_features': 6
    }
    pipeline_path = os.path.join(prep_dir, 'crop_preprocessing_pipeline.joblib')
    joblib.dump(pipeline_obj, pipeline_path)
    print(f"Preprocessing pipeline saved to: {pipeline_path}")

    # Candidate Models Evaluation
    candidate_models = {
        'Random Forest': (RandomForestClassifier(n_estimators=100, random_state=42), False),
        'Decision Tree': (DecisionTreeClassifier(random_state=42), False),
        'Logistic Regression': (LogisticRegression(max_iter=1000, random_state=42), True),
        'Gaussian Naive Bayes': (GaussianNB(), True),
        'Support Vector Classifier': (SVC(kernel='rbf', random_state=42), True)
    }

    results = {}
    best_model_name = None
    best_f1_score = -1.0
    best_model_obj = None

    print("\n---------------------------------------------------------------------------------------------")
    print(f"{'Model Name':<26} | {'Train Acc':<9} | {'Test Acc':<9} | {'Precision':<9} | {'Recall':<9} | {'F1 (Macro)':<9}")
    print("---------------------------------------------------------------------------------------------")

    for name, (model, requires_scaling) in candidate_models.items():
        X_tr = X_train_scaled if requires_scaling else X_train.values
        X_te = X_test_scaled if requires_scaling else X_test.values

        model.fit(X_tr, y_train)

        y_tr_pred = model.predict(X_tr)
        y_te_pred = model.predict(X_te)

        tr_acc = float(accuracy_score(y_train, y_tr_pred))
        te_acc = float(accuracy_score(y_test, y_te_pred))
        prec_macro = float(precision_score(y_test, y_te_pred, average='macro', zero_division=0))
        rec_macro = float(recall_score(y_test, y_te_pred, average='macro', zero_division=0))
        f1_macro = float(f1_score(y_test, y_te_pred, average='macro', zero_division=0))

        prec_weighted = float(precision_score(y_test, y_te_pred, average='weighted', zero_division=0))
        rec_weighted = float(recall_score(y_test, y_te_pred, average='weighted', zero_division=0))
        f1_weighted = float(f1_score(y_test, y_te_pred, average='weighted', zero_division=0))

        cm = confusion_matrix(y_test, y_te_pred).tolist()

        results[name] = {
            'train_accuracy': tr_acc,
            'test_accuracy': te_acc,
            'precision_macro': prec_macro,
            'recall_macro': rec_macro,
            'f1_macro': f1_macro,
            'precision_weighted': prec_weighted,
            'recall_weighted': rec_weighted,
            'f1_weighted': f1_weighted,
            'requires_scaling': requires_scaling,
            'confusion_matrix': cm
        }

        print(f"{name:<26} | {tr_acc*100:8.2f}% | {te_acc*100:8.2f}% | {prec_macro:9.4f} | {rec_macro:9.4f} | {f1_macro:9.4f}")

        if f1_macro > best_f1_score:
            best_f1_score = f1_macro
            best_model_name = name
            best_model_obj = model

    print("---------------------------------------------------------------------------------------------")
    print(f"\nSELECTED MODEL: {best_model_name} (F1 Macro: {best_f1_score:.4f})")

    # Save Final Model
    best_model_save_path = os.path.join(models_dir, 'crop_recommendation_model.joblib')
    model_bundle = {
        'model_name': best_model_name,
        'model': best_model_obj,
        'requires_scaling': candidate_models[best_model_name][1],
        'feature_names': feature_cols,
        'num_features': 6
    }
    joblib.dump(model_bundle, best_model_save_path)
    print(f"Saved final trained model bundle to: {best_model_save_path}")

    # Save Evaluation Report
    eval_report_path = os.path.join(eval_dir, 'model_evaluation_report.json')
    report_data = {
        'dataset': 'Crop_recommendation.csv',
        'rows': len(df),
        'features_count': len(feature_cols),
        'features': feature_cols,
        'rainfall_used': False,
        'EC_used': False,
        'classes_count': len(class_names),
        'selected_model': best_model_name,
        'models_performance': results
    }
    with open(eval_report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2)
    print(f"Saved evaluation report to: {eval_report_path}")

if __name__ == '__main__':
    train_and_evaluate()
