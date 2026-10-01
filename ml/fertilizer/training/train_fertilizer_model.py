import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

def train_and_evaluate():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset_path = os.path.join(base_dir, 'dataset', 'fertilizer_recommendation.csv')
    models_dir = os.path.join(base_dir, 'models')
    prep_dir = os.path.join(base_dir, 'preprocessing')
    eval_dir = os.path.join(base_dir, 'evaluation')

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(prep_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    print("==================================================")
    print(" NUTRISOIL — TWO-PATH FERTILIZER TRAINING PIPELINE")
    print("==================================================")
    print(f"Loading dataset from: {dataset_path}")

    df = pd.read_csv(dataset_path)
    print(f"Dataset Loaded. Total Rows: {len(df)}, Total Columns: {len(df.columns)}")

    target_col = 'Recommended_Fertilizer'
    y_raw = df[target_col].copy()

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    class_names = list(label_encoder.classes_)
    dataset_crops = sorted(list(df['Crop_Type'].unique()))
    class_dist = pd.Series(y_raw).value_counts().to_dict()

    print(f"Target Classes ({len(class_names)}): {class_names}")
    print(f"Fertilizer Dataset Crops ({len(dataset_crops)}): {dataset_crops}")

    # =========================================================================
    # PATH A: CROP-AWARE MODEL (8 Features)
    # =========================================================================
    print("\n--------------------------------------------------")
    print(" TRAIN PATH A: CROP-AWARE FERTILIZER MODEL (8 Features)")
    print("--------------------------------------------------")

    features_path_a = [
        'Nitrogen_Level', 'Phosphorus_Level', 'Potassium_Level',
        'Soil_pH', 'Electrical_Conductivity', 'Temperature', 'Soil_Moisture',
        'Crop_Type'
    ]

    X_a = df[features_path_a].copy()
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(
        X_a, y, test_size=0.20, random_state=42, stratify=y
    )

    num_cols_a = X_train_a.select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_cols_a = X_train_a.select_dtypes(include=['object', 'str']).columns.tolist()

    preprocessor_a = ColumnTransformer([
        ('num', StandardScaler(), num_cols_a),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols_a)
    ])

    X_train_a_trans = preprocessor_a.fit_transform(X_train_a)
    X_test_a_trans = preprocessor_a.transform(X_test_a)

    candidate_models_a = {
        'Random Forest (Balanced)': RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced'),
        'Extra Trees (Balanced)': ExtraTreesClassifier(n_estimators=200, random_state=42, class_weight='balanced'),
        'Decision Tree (Balanced)': DecisionTreeClassifier(random_state=42, class_weight='balanced'),
        'Logistic Regression (Balanced)': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'Gaussian Naive Bayes': GaussianNB()
    }

    results_a = {}
    best_name_a, best_f1_a, best_model_a = None, -1.0, None

    print(f"{'Model Name':<30} | {'Tr Acc':<7} | {'Te Acc':<7} | {'P (Mac)':<7} | {'R (Mac)':<7} | {'F1 (Mac)':<8} | {'F1 (Wtd)':<8}")
    print("-" * 92)

    for name, model in candidate_models_a.items():
        model.fit(X_train_a_trans, y_train_a)
        y_tr_pred = model.predict(X_train_a_trans)
        y_te_pred = model.predict(X_test_a_trans)

        tr_acc = float(accuracy_score(y_train_a, y_tr_pred))
        te_acc = float(accuracy_score(y_test_a, y_te_pred))
        macro_p = float(precision_score(y_test_a, y_te_pred, average='macro', zero_division=0))
        macro_r = float(recall_score(y_test_a, y_te_pred, average='macro', zero_division=0))
        macro_f1 = float(f1_score(y_test_a, y_te_pred, average='macro', zero_division=0))
        wtd_f1 = float(f1_score(y_test_a, y_te_pred, average='weighted', zero_division=0))

        results_a[name] = {
            'train_accuracy': tr_acc, 'test_accuracy': te_acc,
            'precision_macro': macro_p, 'recall_macro': macro_r,
            'f1_macro': macro_f1, 'f1_weighted': wtd_f1,
            'confusion_matrix': confusion_matrix(y_test_a, y_te_pred).tolist(),
            'per_class_performance': classification_report(y_test_a, y_te_pred, target_names=class_names, output_dict=True, zero_division=0)
        }

        print(f"{name:<30} | {tr_acc*100:6.2f}% | {te_acc*100:6.2f}% | {macro_p:7.4f} | {macro_r:7.4f} | {macro_f1:8.4f} | {wtd_f1:8.4f}")

        if macro_f1 > best_f1_a:
            best_f1_a = macro_f1
            best_name_a = name
            best_model_a = model

    print(f"SELECTED PATH A MODEL: {best_name_a} (Macro F1: {best_f1_a:.4f})")

    # =========================================================================
    # PATH B: SOIL-ONLY MODEL (7 Features)
    # =========================================================================
    print("\n--------------------------------------------------")
    print(" TRAIN PATH B: SOIL-ONLY FERTILIZER MODEL (7 Features)")
    print("--------------------------------------------------")

    features_path_b = [
        'Nitrogen_Level', 'Phosphorus_Level', 'Potassium_Level',
        'Soil_pH', 'Electrical_Conductivity', 'Temperature', 'Soil_Moisture'
    ]

    X_b = df[features_path_b].copy()
    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(
        X_b, y, test_size=0.20, random_state=42, stratify=y
    )

    num_cols_b = X_train_b.select_dtypes(include=['int64', 'float64']).columns.tolist()

    preprocessor_b = ColumnTransformer([
        ('num', StandardScaler(), num_cols_b)
    ])

    X_train_b_trans = preprocessor_b.fit_transform(X_train_b)
    X_test_b_trans = preprocessor_b.transform(X_test_b)

    candidate_models_b = {
        'Random Forest (Balanced)': RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced'),
        'Extra Trees (Balanced)': ExtraTreesClassifier(n_estimators=200, random_state=42, class_weight='balanced'),
        'Decision Tree (Balanced)': DecisionTreeClassifier(random_state=42, class_weight='balanced'),
        'Logistic Regression (Balanced)': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'Gaussian Naive Bayes': GaussianNB()
    }

    results_b = {}
    best_name_b, best_f1_b, best_model_b = None, -1.0, None

    print(f"{'Model Name':<30} | {'Tr Acc':<7} | {'Te Acc':<7} | {'P (Mac)':<7} | {'R (Mac)':<7} | {'F1 (Mac)':<8} | {'F1 (Wtd)':<8}")
    print("-" * 92)

    for name, model in candidate_models_b.items():
        model.fit(X_train_b_trans, y_train_b)
        y_tr_pred = model.predict(X_train_b_trans)
        y_te_pred = model.predict(X_test_b_trans)

        tr_acc = float(accuracy_score(y_train_b, y_tr_pred))
        te_acc = float(accuracy_score(y_test_b, y_te_pred))
        macro_p = float(precision_score(y_test_b, y_te_pred, average='macro', zero_division=0))
        macro_r = float(recall_score(y_test_b, y_te_pred, average='macro', zero_division=0))
        macro_f1 = float(f1_score(y_test_b, y_te_pred, average='macro', zero_division=0))
        wtd_f1 = float(f1_score(y_test_b, y_te_pred, average='weighted', zero_division=0))

        results_b[name] = {
            'train_accuracy': tr_acc, 'test_accuracy': te_acc,
            'precision_macro': macro_p, 'recall_macro': macro_r,
            'f1_macro': macro_f1, 'f1_weighted': wtd_f1,
            'confusion_matrix': confusion_matrix(y_test_b, y_te_pred).tolist(),
            'per_class_performance': classification_report(y_test_b, y_te_pred, target_names=class_names, output_dict=True, zero_division=0)
        }

        print(f"{name:<30} | {tr_acc*100:6.2f}% | {te_acc*100:6.2f}% | {macro_p:7.4f} | {macro_r:7.4f} | {macro_f1:8.4f} | {wtd_f1:8.4f}")

        if macro_f1 > best_f1_b:
            best_f1_b = macro_f1
            best_name_b = name
            best_model_b = model

    print(f"SELECTED PATH B MODEL: {best_name_b} (Macro F1: {best_f1_b:.4f})")

    # =========================================================================
    # SAVE ARTIFACTS
    # =========================================================================
    # 1. Path A Artifacts
    joblib.dump({'model_name': best_name_a, 'model': best_model_a, 'selected_features': features_path_a}, os.path.join(models_dir, 'crop_aware_fertilizer_model.joblib'))
    joblib.dump({'preprocessor': preprocessor_a, 'label_encoder': label_encoder, 'selected_features': features_path_a, 'classes': class_names, 'dataset_crops': dataset_crops}, os.path.join(prep_dir, 'crop_aware_preprocessing_pipeline.joblib'))

    # 2. Path B Artifacts
    joblib.dump({'model_name': best_name_b, 'model': best_model_b, 'selected_features': features_path_b}, os.path.join(models_dir, 'soil_only_fertilizer_model.joblib'))
    joblib.dump({'preprocessor': preprocessor_b, 'label_encoder': label_encoder, 'selected_features': features_path_b, 'classes': class_names}, os.path.join(prep_dir, 'soil_only_preprocessing_pipeline.joblib'))

    # 3. Master Bundles for single-file loaders
    master_models = {
        'path_a_crop_aware': {'model_name': best_name_a, 'model': best_model_a, 'selected_features': features_path_a},
        'path_b_soil_only': {'model_name': best_name_b, 'model': best_model_b, 'selected_features': features_path_b}
    }
    joblib.dump(master_models, os.path.join(models_dir, 'fertilizer_recommendation_model.joblib'))

    master_prep = {
        'path_a_crop_aware': {'preprocessor': preprocessor_a, 'selected_features': features_path_a},
        'path_b_soil_only': {'preprocessor': preprocessor_b, 'selected_features': features_path_b},
        'label_encoder': label_encoder,
        'classes': class_names,
        'dataset_crops': dataset_crops
    }
    joblib.dump(master_prep, os.path.join(prep_dir, 'fertilizer_preprocessing_pipeline.joblib'))

    print("\nSaved all Path A and Path B model and preprocessing artifacts successfully.")

    # 4. Save Combined Evaluation Report JSON
    eval_report_path = os.path.join(eval_dir, 'model_evaluation_report.json')
    report_data = {
        'architecture': 'Two-Path Fertilizer Recommendation Design',
        'dataset': 'fertilizer_recommendation.csv',
        'rows': len(df),
        'classes_count': len(class_names),
        'class_distribution': class_dist,
        'dataset_crops': dataset_crops,
        'path_a_crop_aware': {
            'features_count': len(features_path_a),
            'features': features_path_a,
            'selected_model': best_name_a,
            'models_performance': results_a
        },
        'path_b_soil_only': {
            'features_count': len(features_path_b),
            'features': features_path_b,
            'selected_model': best_name_b,
            'models_performance': results_b
        }
    }

    with open(eval_report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2)
    print(f"Saved two-path evaluation report to: {eval_report_path}")

if __name__ == '__main__':
    train_and_evaluate()
