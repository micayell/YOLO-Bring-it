import sys
import os
import json
import grpc
from concurrent import futures
import logging
import time
from grpc_reflection.v1alpha import reflection

# 현재 파일의 디렉토리 기준으로 protos/generated 경로 추가
generated_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'protos', 'generated'))
if generated_path not in sys.path:
    sys.path.insert(0, generated_path)

# 디버깅: 경로와 파일 존재 여부 확인
print("Generated path:", generated_path)
print("sys.path:", sys.path)
print("object_detection_pb2 exists:", os.path.exists(os.path.join(generated_path, 'object_detection_pb2.py')))

# 서비스 임포트
from protos.generated.object_detection_pb2 import *
from protos.generated.object_detection_pb2_grpc import *
from protos.generated.face_analysis_pb2 import *
from protos.generated.face_analysis_pb2_grpc import *
from protos.generated.picture_similar_pb2 import *
from protos.generated.picture_similar_pb2_grpc import *
from protos.generated.voice_grade_pb2 import *
from protos.generated.voice_grade_pb2_grpc import *

# AI 모듈 임포트
from ai_processors.object_detection import process_object_detection
from ai_processors.face_emotion import analyze_face_emotion
from ai_processors.picture_similar import check_picture_similarity
from ai_processors.voice_grade import check_voice_similarity


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ObjectDetectServicer(ObjectDetectServiceServicer):
    def Detect(self, request, context):
        logger.info(f"Received ObjectDetect request: user_id={request.user_id}, target_item={request.target_item}, image_base64_length={len(request.image_base64)}")
        try:
            result = process_object_detection(request.image_base64, request.target_item)
            status = json.dumps({
                "userId": request.user_id,
                "result": result["result"],
                "error": None
            }, ensure_ascii=False)
            logger.info(f"ObjectDetect response: {status}")
            return DetectResponse(
                status=status,
                user_id=request.user_id
            )
        except Exception as e:
            logger.error(f"ObjectDetect error: {str(e)}")
            context.set_details(f"Error processing image: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return DetectResponse(
                status=json.dumps({
                    "userId": request.user_id,
                    "result": "FAIL",
                    "error": str(e)
                }, ensure_ascii=False),
                user_id=request.user_id
            )
        
class FaceAnalysisServicer(FaceAnalysisServiceServicer):
    def AnalyzeEmotion(self, request, context):
        logger.info(f"Received FaceAnalysis request: user_id={request.user_id}, do_emotion={request.do_emotion}, image_base64_length={len(request.image_base64)}")
        try:
            result = analyze_face_emotion(request.image_base64, request.do_emotion)
            if result.startswith("Error") or result == "Face not detected":
                status = json.dumps({
                    "userId": request.user_id,  # type → userId
                    "result": "FAIL",
                    "top_emotions": [],
                    "error": result
                }, ensure_ascii=False)
            else:
                emotion, score = result.split(":") if ":" in result else ("unknown", "0.00%")
                status = json.dumps({
                    "userId": request.user_id,
                    "result": "PASS",
                    "top_emotions": [f"{emotion}:{score}"],
                    "error": None
                }, ensure_ascii=False)
            logger.info(f"FaceAnalysis response: {status}")
            return AnalyzeEmotionResponse(
                status=status,
                user_id=request.user_id
            )
        except Exception as e:
            logger.error(f"FaceAnalysis error: {str(e)}")
            context.set_details(f"Error processing image: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return AnalyzeEmotionResponse(
                status=json.dumps({
                    "userId": request.user_id,
                    "result": "FAIL",
                    "error": str(e)
                }, ensure_ascii=False),
                user_id=request.user_id
            )

class PictureSimilarServicer(PictureSimilarServiceServicer):
    def CheckSimilarity(self, request, context):
        logger.info(f"Received PictureSimilar request: user_id={request.user_id}, target_picture={request.target_picture}, image_base64_length={len(request.image_base64)}")
        try:
            result = check_picture_similarity(request.image_base64, request.target_picture)
            status = json.dumps({
                "userId": request.user_id,
                "result": "PASS" if result.get("is_similar", False) else "FAIL",
                "similarity_percent": result.get("similarity_percent", "0.00%"),
                "error": None
            }, ensure_ascii=False)
            logger.info(f"PictureSimilar response: {status}")
            return CheckSimilarityResponse(
                status=status,
                user_id=request.user_id
            )
        except Exception as e:
            logger.error(f"PictureSimilar error: {str(e)}", exc_info=True)
            context.set_details(f"Error processing image: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return CheckSimilarityResponse(
                status=json.dumps({
                    "userId": request.user_id,
                    "result": "FAIL",
                    "similarity_percent": "0.00%",
                    "error": str(e)
                }, ensure_ascii=False),
                user_id=request.user_id
            )
        
class VoiceGradeServicer(VoiceGradeServiceServicer):
    def CheckSimilarity(self, request, context):
        logger.info(f"Received VoiceGrade request: user_id={request.user_id}, language={request.language}, target_audio_length={len(request.target_audio_base64)}, user_audio_length={len(request.user_audio_base64)}")
        try:
            result = check_voice_similarity(
                request.target_audio_base64,
                request.user_audio_base64,
                request.language
            )
            status = json.dumps({
                "userId": request.user_id,
                "result": "PASS" if result.get("is_similar", False) else "FAIL",
                "target_text": result.get("target_text", ""),
                "user_text": result.get("user_text", ""),
                "text_score_percent": result.get("text_score_percent", 0.0),
                "audio_score_percent": result.get("audio_score_percent", 0.0),
                "overall_score_percent": result.get("overall_score_percent", 0.0),
                "error": None
            }, ensure_ascii=False)
            logger.info(f"VoiceGrade response: {status}")
            return CheckSimilarityResponse(
                status=status,
                user_id=request.user_id
            )
        except Exception as e:
            logger.error(f"VoiceGrade error: {str(e)}", exc_info=True)
            context.set_details(f"Error processing audio: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return CheckSimilarityResponse(
                status=json.dumps({
                    "userId": request.user_id,
                    "result": "FAIL",
                    "target_text": "",
                    "user_text": "",
                    "text_score_percent": 0.0,
                    "audio_score_percent": 0.0,
                    "overall_score_percent": 0.0,
                    "error": str(e)
                }, ensure_ascii=False),
                user_id=request.user_id
            )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_ObjectDetectServiceServicer_to_server(ObjectDetectServicer(), server)
    add_FaceAnalysisServiceServicer_to_server(FaceAnalysisServicer(), server)
    add_PictureSimilarServiceServicer_to_server(PictureSimilarServicer(), server)
    add_VoiceGradeServiceServicer_to_server(VoiceGradeServicer(), server)

    SERVICE_NAMES = (
        'object_detect.ObjectDetectService',
        'face_analysis.FaceAnalysisService',
        'picture_similar.PictureSimilarService',
        'voice_grade.VoiceGradeService',
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port("[::]:50051")
    server.start()
    logger.info("gRPC 서버 시작 (포트 50051) - Reflection 활성화됨")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == "__main__":
    serve()