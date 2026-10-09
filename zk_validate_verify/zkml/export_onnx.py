import pickle
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

with open("zkml/fraud_model.pkl", "rb") as f:
    model = pickle.load(f)

# Input: batch of invoices, 5 features each
initial_type = [("invoice_features", FloatTensorType([None, 5]))]

onnx_model = convert_sklearn(
    model,
    initial_types=initial_type,
    target_opset=12,          # Sindri supports up to opset 12
    options={"zipmap": False} # return raw arrays, not dicts
)

with open("zkml/fraud_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("ONNX model saved to zkml/fraud_model.onnx")

# Verify it runs locally before uploading to Sindri
import onnxruntime as rt
sess = rt.InferenceSession("zkml/fraud_model.onnx")

test_cases = [
    ("Normal invoice",     [[0.5, 2.0, 0.15, 1.0, 0.3]]),
    ("Suspicious invoice", [[0.99, 9.0, 0.001, 6.0, 2.8]]),
]
for label, features in test_cases:
    inp    = np.array(features, dtype=np.float32)
    output = sess.run(None, {"invoice_features": inp})
    pred   = "ANOMALY" if output[0][0] == -1 else "NORMAL"
    score  = output[1][0][1] if len(output) > 1 else "n/a"
    print(f"  {label}: {pred}")

print("ONNX export verified.")
