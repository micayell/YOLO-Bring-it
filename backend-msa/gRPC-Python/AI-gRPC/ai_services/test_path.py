# test_import.py
import sys
import os
generated_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'protos', 'generated'))
sys.path.insert(0, generated_path)
try:
    import object_detection_pb2
    print("Imported object_detection_pb2 successfully")
    import object_detection_pb2_grpc
    print("Imported object_detection_pb2_grpc successfully")
except ImportError as e:
    print(f"Import failed: {e}")