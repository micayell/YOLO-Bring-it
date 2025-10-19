import base64
import io
import numpy as np
from PIL import Image
from ultralytics import YOLO
import logging

logger = logging.getLogger(__name__)

model = YOLO("yolov8n.pt")  # 서버 시작 시 로드

def process_object_detection(image_base64, target_item):
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image_np = np.array(image)

        results = model(image_np)
        detected_classes = [model.names[int(cls)] for result in results if result.boxes for cls in result.boxes.cls]

        result = "PASS" if target_item in detected_classes else "FAIL"
        return {
            "result": result
        }
    except Exception as e:
        logger.error(f"Object Detection 오류: {str(e)}")
        raise ValueError(f"Object Detection 처리 중 오류: {str(e)}")