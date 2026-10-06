import os
import joblib

class MLEmailService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_path = os.path.join(base_dir, "models", "email", "email_model.pkl")
        self.vec_path = os.path.join(base_dir, "models", "email", "email_vectorizer.pkl")
        self.model = None
        self.vectorizer = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.vec_path):
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vec_path)
        else:
            print("Email ML Model not found. Please train the model using Kaggle dataset first.")

    def analyze(self, text: str) -> dict:
        if not self.model or not self.vectorizer:
            return {
                "result": "ERROR",
                "confidence": 0.0,
                "details": ["ML Model not trained. Please download Kaggle dataset and run training script."]
            }
        
        vec_text = self.vectorizer.transform([text])
        prediction = self.model.predict(vec_text)[0]
        prob = self.model.predict_proba(vec_text)[0]
        
        confidence = max(prob) * 100
        result = "FAKE" if prediction == 1 else "REAL"

        return {
            "result": result,
            "confidence": round(confidence, 2),
            "details": ["Prediction provided by ML Email Classification Model (Kaggle Dataset)."]
        }
