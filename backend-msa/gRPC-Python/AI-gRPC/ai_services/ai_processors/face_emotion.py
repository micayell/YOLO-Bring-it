import base64
import io
import numpy as np
from PIL import Image
from deepface import DeepFace
from rembg import remove

def analyze_face_emotion(image_base64, do_emotion):
    # Base64 디코딩 및 이미지 로드
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        return f"Error decoding image: {str(e)}"

    # 배경 제거
    try:
        result_bytes = remove(image_data)
        image_nobg = Image.open(io.BytesIO(result_bytes)).convert("RGB")
    except Exception as e:
        return f"Error removing background: {str(e)}"

    # 감정 분석
    try:
        image_np = np.array(image_nobg)
        result = DeepFace.analyze(img_path=image_np, actions=["emotion"], enforce_detection=True)[0]
        emotions = result["emotion"]
        
        # do_emotion이 특정 감정(예: "happy", "sad")일 때 해당 점수 반환
        do_emotion = do_emotion.lower()
        if do_emotion not in emotions:
            return f"Emotion '{do_emotion}' not recognized"
        
        score = emotions.get(do_emotion, 0.0)
        return f"{do_emotion}:{score:.2f}%"
    except ValueError:
        return "Face not detected"
    except Exception as e:
        return f"Error: {str(e)}"