from fastapi import FastAPI, File, UploadFile
from ai_gateway.grpc_clients.object_detect_client import detect_object

app = FastAPI()

@app.post("/detect-object")
async def detect_object_route(file: UploadFile = File(...)):
    image_bytes = await file.read()
    print("업로드된 이미지 크기:", len(image_bytes), "타입:", type(image_bytes))
    result = detect_object(image_bytes)
    return result