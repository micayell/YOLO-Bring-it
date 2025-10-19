import base64
import io
import numpy as np
import librosa
import tempfile
import os
import logging
from transformers import pipeline
from scipy.spatial.distance import cosine
import difflib

logger = logging.getLogger(__name__)

# Whisper 모델 로드 (서버 시작 시 한 번만)
try:
    whisper_processor = pipeline("automatic-speech-recognition", model="openai/whisper-tiny")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {str(e)}")
    raise

def check_voice_similarity(target_audio_base64, user_audio_base64, language="ko-KR"):
    try:
        # Base64 디코딩
        target_audio_data = base64.b64decode(target_audio_base64)
        user_audio_data = base64.b64decode(user_audio_base64)

        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as target_temp, \
             tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as user_temp:
            target_temp.write(target_audio_data)
            user_temp.write(user_audio_data)
            target_path = target_temp.name
            user_path = user_temp.name

        # 오디오 로드
        target_y, target_sr = librosa.load(target_path, sr=16000)
        user_y, user_sr = librosa.load(user_path, sr=16000)

        # MFCC 비교
        target_mfcc = librosa.feature.mfcc(y=target_y, sr=target_sr, n_mfcc=13).mean(axis=1)
        user_mfcc = librosa.feature.mfcc(y=user_y, sr=user_sr, n_mfcc=13).mean(axis=1)
        mfcc_sim = max(0, 1 - cosine(target_mfcc, user_mfcc))

        # 피치 비교
        target_pitch, _, _ = librosa.pyin(target_y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        user_pitch, _, _ = librosa.pyin(user_y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        target_pitch_mean = np.nanmean(target_pitch)
        user_pitch_mean = np.nanmean(user_pitch)
        pitch_sim = 0
        if target_pitch_mean and user_pitch_mean:
            pitch_sim = max(0, min(1, 1 - abs(target_pitch_mean - user_pitch_mean) / max(target_pitch_mean, user_pitch_mean, 1e-6)))

        # 템포 비교
        target_tempo = float(librosa.beat.beat_track(y=target_y, sr=target_sr)[0])
        user_tempo = float(librosa.beat.beat_track(y=user_y, sr=user_sr)[0])
        tempo_sim = 0
        if target_tempo > 0 and user_tempo > 0:
            tempo_sim = max(0, min(1, 1 - abs(target_tempo - user_tempo) / max(target_tempo, user_tempo)))

        # 오디오 유사도 점수
        audio_score = (mfcc_sim + pitch_sim + tempo_sim) / 3
        audio_score_percent = round(audio_score * 100, 2)

        # STT 처리
        lang_map = {"ko-KR": "korean", "en-US": "english"}
        lang_name = lang_map.get(language, "korean")
        forced_decoder_ids = whisper_processor.tokenizer.get_decoder_prompt_ids(language=lang_name, task="transcribe")

        target_result = whisper_processor(target_path, generate_kwargs={"forced_decoder_ids": forced_decoder_ids, "language": lang_name})
        user_result = whisper_processor(user_path, generate_kwargs={"forced_decoder_ids": forced_decoder_ids, "language": lang_name})
        target_text = target_result.get("text", "").strip()
        user_text = user_result.get("text", "").strip()

        if not target_text or not user_text:
            raise ValueError("STT 인식 실패: 오디오가 명확하지 않거나 언어 설정을 확인하세요.")

        # 텍스트 유사도
        text_ratio = difflib.SequenceMatcher(None, target_text, user_text).ratio()
        text_score_percent = round(text_ratio * 100, 2)

        # 종합 점수
        overall_score_percent = round((text_score_percent * 0.5 + audio_score_percent * 0.5), 2)

        # 임시 파일 삭제
        os.unlink(target_path)
        os.unlink(user_path)

        logger.info(f"Voice similarity: target_text={target_text}, user_text={user_text}, text_score={text_score_percent}%, audio_score={audio_score_percent}%, overall_score={overall_score_percent}%")
        return {
            "target_text": target_text,
            "user_text": user_text,
            "text_score_percent": text_score_percent,
            "audio_score_percent": audio_score_percent,
            "overall_score_percent": overall_score_percent,
            "is_similar": True  # 처리 성공 시 PASS
        }
    except Exception as e:
        logger.error(f"Voice similarity error: {str(e)}")
        raise ValueError(f"Voice similarity 처리 중 오류: {str(e)}")