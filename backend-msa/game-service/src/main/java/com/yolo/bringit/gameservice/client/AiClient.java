package com.yolo.bringit.gameservice.client;

import com.google.protobuf.ByteString;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import object_detect.ObjectDetection;
import object_detect.ObjectDetectServiceGrpc;
import face_analysis.FaceAnalysis;
import face_analysis.FaceAnalysisServiceGrpc;
import picture_similar.PictureSimilar;
import picture_similar.PictureSimilarServiceGrpc;
import voice_grade.VoiceGrade;
import voice_grade.VoiceGradeServiceGrpc;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

@Component
public class AiClient {
    private final ManagedChannel channel;
    private final ObjectDetectServiceGrpc.ObjectDetectServiceBlockingStub objectStub;
    private final FaceAnalysisServiceGrpc.FaceAnalysisServiceBlockingStub faceStub;
    private final PictureSimilarServiceGrpc.PictureSimilarServiceBlockingStub pictureStub;
    private final VoiceGradeServiceGrpc.VoiceGradeServiceBlockingStub voiceStub;

    public AiClient(
            @Value("${grpc.host}") String grpcHost,
            @Value("${grpc.port}") int grpcPort) {
        this.channel = ManagedChannelBuilder.forAddress(grpcHost, grpcPort)
                .usePlaintext()
                .build();
        this.objectStub = ObjectDetectServiceGrpc.newBlockingStub(channel);
        this.faceStub = FaceAnalysisServiceGrpc.newBlockingStub(channel);
        this.pictureStub = PictureSimilarServiceGrpc.newBlockingStub(channel);
        this.voiceStub = VoiceGradeServiceGrpc.newBlockingStub(channel);
    }

    public ObjectDetection.DetectResponse detectObject(MultipartFile image, String targetItem) {
        try {
            byte[] imageBytes = image.getBytes();
            ObjectDetection.DetectRequest request = ObjectDetection.DetectRequest.newBuilder()
                    .setImageData(ByteString.copyFrom(imageBytes))
                    .setTargetItem(targetItem)
                    .build();
            return objectStub.detect(request);
        } catch (io.grpc.StatusRuntimeException e) {
            throw new RuntimeException("gRPC 호출 오류 (Object Detection): " + e.getStatus().getDescription(), e);
        } catch (IOException e) {
            throw new RuntimeException("객체 탐지 오류: " + e.getMessage(), e);
        }
    }

    public FaceAnalysis.AnalyzeEmotionResponse analyzeFaceEmotion(MultipartFile image, String doEmotion) {
        try {
            byte[] imageBytes = image.getBytes();
            FaceAnalysis.AnalyzeEmotionRequest request = FaceAnalysis.AnalyzeEmotionRequest.newBuilder()
                    .setImageData(ByteString.copyFrom(imageBytes))
                    .setDoEmotion(doEmotion)
                    .build();
            return faceStub.analyzeEmotion(request);
        } catch (io.grpc.StatusRuntimeException e) {
            throw new RuntimeException("gRPC 호출 오류 (Face Analysis): " + e.getStatus().getDescription(), e);
        } catch (IOException e) {
            throw new RuntimeException("감정 분석 오류: " + e.getMessage(), e);
        }
    }

    public PictureSimilar.CheckSimilarityResponse checkSimilarity(MultipartFile image, String targetPicture) {
        try {
            byte[] imageBytes = image.getBytes();
            PictureSimilar.CheckSimilarityRequest request = PictureSimilar.CheckSimilarityRequest.newBuilder()
                    .setImageData(ByteString.copyFrom(imageBytes))
                    .setTargetPicture(targetPicture)
                    .build();
            return pictureStub.checkSimilarity(request);
        } catch (io.grpc.StatusRuntimeException e) {
            throw new RuntimeException("gRPC 호출 오류 (Picture Similar): " + e.getStatus().getDescription(), e);
        } catch (IOException e) {
            throw new RuntimeException("그림 유사도 분석 오류: " + e.getMessage(), e);
        }
    }

    public VoiceGrade.CheckSimilarityResponse checkVoiceSimilarity(MultipartFile targetAudio, MultipartFile userAudio, String language) {
        try {
            byte[] targetAudioBytes = targetAudio.getBytes();
            byte[] userAudioBytes = userAudio.getBytes();
            VoiceGrade.CheckSimilarityRequest request = VoiceGrade.CheckSimilarityRequest.newBuilder()
                    .setTargetAudioData(ByteString.copyFrom(targetAudioBytes))
                    .setUserAudioData(ByteString.copyFrom(userAudioBytes))
                    .setLanguage(language)
                    .build();
            return voiceStub.checkSimilarity(request);
        } catch (io.grpc.StatusRuntimeException e) {
            throw new RuntimeException("gRPC 호출 오류 (Voice Similarity): " + e.getStatus().getDescription(), e);
        } catch (IOException e) {
            throw new RuntimeException("음성 유사도 분석 오류: " + e.getMessage(), e);
        }
    }

    public void shutdown() {
        channel.shutdown();
    }
}