from pathlib import Path
import io

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = ROOT / "model" / "deepfake_mobilenetv2_best.keras"
IMAGE_SIZE = (224, 224)

print(f"Loading model: {MODEL_PATH}")

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("MobileNetV2 model loaded successfully.")


def load_image(image_source):
    """
    Load image from:
    - bytes
    - file path
    """

    if isinstance(image_source, bytes):
        image = Image.open(io.BytesIO(image_source))
    elif isinstance(image_source, (str, Path)):
        image = Image.open(image_source)
    else:
        raise TypeError("image_source must be bytes or a file path")

    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    return image


def detect_faces(image):
    """
    Face detection is informational only.
    It does not affect REAL/FAKE prediction.
    """

    try:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

        if not Path(cascade_path).exists():
            return 0

        gray = cv2.cvtColor(
            np.array(image),
            cv2.COLOR_RGB2GRAY
        )

        face_cascade = cv2.CascadeClassifier(cascade_path)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5
        )

        return len(faces)

    except Exception:
        return 0


def preprocess_image(image):
    """
    Resize image for MobileNetV2.
    Model already contains MobileNetV2 preprocessing.
    """

    image = image.resize(IMAGE_SIZE)

    image_array = np.asarray(
        image,
        dtype=np.float32
    )

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


def predict_image(image_source):
    """
    Predict REAL or FAKE.
    """

    image = load_image(image_source)

    original_width, original_height = image.size

    faces_detected = detect_faces(image)

    processed_image = preprocess_image(image)

    prediction = float(
        model.predict(
            processed_image,
            verbose=0
        )[0][0]
    )

    if prediction >= 0.5:
        label = "REAL"
        confidence = prediction
    else:
        label = "FAKE"
        confidence = 1 - prediction

    confidence_percent = round(
        confidence * 100,
        2
    )

    if confidence_percent >= 90:
        confidence_level = "HIGH"
    elif confidence_percent >= 70:
        confidence_level = "MEDIUM"
    else:
        confidence_level = "LOW"

    return {
        "prediction": label,
        "confidence": confidence_percent,
        "raw_score": round(prediction, 6),
        "faces_detected": faces_detected,
        "original_image_size": {
            "width": original_width,
            "height": original_height
        },
        "model_input_size": {
            "width": IMAGE_SIZE[0],
            "height": IMAGE_SIZE[1]
        },
        "confidence_level": confidence_level
    }
