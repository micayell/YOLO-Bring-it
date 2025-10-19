import grpc
import base64
from ai_services.object_detect import object_detect_pb2, object_detect_pb2_grpc

def detect_object(image_bytes):
    # 이미지를 Base64로 인코딩
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    print("Base64 문자열 길이:", len(image_base64))
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = object_detect_pb2_grpc.ObjectDetectServiceStub(channel)
        request = object_detect_pb2.DetectRequest(image_base64=image_base64)
        response = stub.Detect(request)
        return {"detected_objects": list(response.detected_objects)}