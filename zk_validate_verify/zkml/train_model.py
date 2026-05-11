import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import pickle
import json
import os

os.makedirs("zkml", exist_ok=True)

# ── Feature engineering ───────────────────────────────────────────────────────
# Five features extracted from each invoice.
# These map directly to what the ZKML circuit receives.
#
# Feature 1: amount_normalised    — invoice amount / coverage_limit (0.0–1.0)
# Feature 2: service_code_bucket  — CPT code range bucket (0–9)
# Feature 3: provider_frequency   — how often this provider submits (0.0–1.0)
# Feature 4: day_of_week          — 0=Monday … 6=Sunday
# Feature 5: amount_zscore        — z-score of amount vs provider history

def extract_features(records_df):
    """
    Transform raw EMTTR records into the 5 model features.
    records_df columns: patient_id, provider_npi, service_code,
                        billed_amount, coverage_limit, service_date
    """
    df = records_df.copy()

    df["amount_normalised"] = (
        df["billed_amount"].astype(float) /
        df["coverage_limit"].astype(float)
    ).clip(0, 1)

    df["service_code_bucket"] = (
        (df["service_code"].astype(int) - 1000) // 1000
    ).clip(0, 9)

    provider_counts = df["provider_npi"].value_counts(normalize=True)
    df["provider_frequency"] = df["provider_npi"].map(provider_counts)

    df["day_of_week"] = pd.to_datetime(df["service_date"]).dt.dayofweek

    provider_stats = df.groupby("provider_npi")["billed_amount"].agg(["mean", "std"])
    df = df.join(
        provider_stats.rename(columns={"mean": "prov_mean", "std": "prov_std"}),
        on="provider_npi"
    )
    df["prov_std"] = df["prov_std"].fillna(1)
    df["amount_zscore"] = (
        (df["billed_amount"].astype(float) - df["prov_mean"]) / df["prov_std"]
    ).clip(-3, 3)

    return df[[
        "amount_normalised",
        "service_code_bucket",
        "provider_frequency",
        "day_of_week",
        "amount_zscore",
    ]].values.astype(np.float32)


# ── Generate synthetic training data ──────────────────────────────────────────
# In production: replace with real EMTTR records via the API
np.random.seed(42)
n_normal = 1000

normal_records = pd.DataFrame({
    "patient_id":     [f"PAT-{i:09d}" for i in range(n_normal)],
    "provider_npi":   np.random.choice(["1234567890", "9876543210", "1122334455"], n_normal),
    "service_code":   np.random.choice(["99213", "99214", "99215", "99212"], n_normal),
    "billed_amount":  np.random.uniform(500, 4000, n_normal),
    "coverage_limit": [5000.0] * n_normal,
    "service_date":   pd.date_range("2024-01-01", periods=n_normal, freq="6h")
                        .strftime("%Y-%m-%d"),
})

X_train = extract_features(normal_records)
print(f"Training on {len(X_train)} records, {X_train.shape[1]} features")

# ── Train model ───────────────────────────────────────────────────────────────
model = Pipeline([
    ("scaler", StandardScaler()),
    ("isoforest", IsolationForest(
        n_estimators=50,      # keep small — ZKML circuits have size limits
        contamination=0.05,   # expect ~5% anomalies
        random_state=42,
        max_features=5,
    ))
])

model.fit(X_train)

# Test on synthetic anomalies
anomaly_records = pd.DataFrame({
    "patient_id":     ["PAT-FRAUD-001"],
    "provider_npi":   ["9999999999"],     # unknown provider
    "service_code":   ["99215"],
    "billed_amount":  [4999.99],          # suspiciously close to limit
    "coverage_limit": [5000.0],
    "service_date":   ["2024-01-01"],
})
X_test = extract_features(anomaly_records)
scores = model.decision_function(X_test)
print(f"Anomaly score for suspicious invoice (lower = more suspicious): {scores[0]:.4f}")
print(f"Predicted: {'ANOMALY' if model.predict(X_test)[0] == -1 else 'NORMAL'}")

# ── Save model ────────────────────────────────────────────────────────────────
with open("zkml/fraud_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("Model saved to zkml/fraud_model.pkl")

json.dump(
    ["amount_normalised", "service_code_bucket",
     "provider_frequency", "day_of_week", "amount_zscore"],
    open("zkml/feature_names.json", "w"),
    indent=2
)
print("Training complete.")
