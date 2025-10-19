import { useState, useRef, useCallback, useEffect } from 'react';

interface UseLocalWebRTCReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnecting: boolean;
  error: string | null;
  startVideo: () => Promise<void>;
  stopVideo: () => void;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  connectVideoElements: () => void;
}

export const useLocalWebRTC = (): UseLocalWebRTCReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상태 변경 추적 로그
  useEffect(() => {
    console.log('📹 비디오 상태 변경:', isVideoEnabled);
  }, [isVideoEnabled]);

  useEffect(() => {
    console.log('🎤 오디오 상태 변경:', isAudioEnabled);
  }, [isAudioEnabled]);

  // 비디오 시작
  const startVideo = useCallback(async () => {
    if (streamRef.current) return; // 이미 실행 중

    setIsConnecting(true);
    setError(null);

    try {
      console.log('📹 로컬 카메라 접근 시도...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      console.log('✅ 스트림 획득 성공! 비디오 요소 연결 대기 중...');

      // 비디오 요소 연결을 다음 렌더링 사이클로 지연
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          console.log('📺 비디오 요소에 스트림 연결 시도...');
          const videoElement = videoRef.current;
          
                     // 비디오 이벤트 리스너
           videoElement.onloadedmetadata = () => {
             console.log('📏 비디오 메타데이터 로드됨:', {
               videoWidth: videoElement.videoWidth,
               videoHeight: videoElement.videoHeight
             });
           };
           
           videoElement.oncanplay = () => {
             console.log('🎬 비디오 재생 준비 완료');
           };
           
           videoElement.onplaying = () => {
             console.log('🎥 비디오 실제 재생 시작됨!');
           };
           
           videoElement.onwaiting = () => {
             console.log('⏳ 비디오 대기 중...');
           };
           
           videoElement.onerror = (error) => {
             console.error('❌ 비디오 에러:', error);
           };
          
                     videoElement.srcObject = streamRef.current;
           
           // 비디오 요소가 실제로 스트림을 받았는지 확인
           console.log('🔍 스트림 연결 확인:', {
             hasSrcObject: !!videoElement.srcObject,
             streamActive: streamRef.current?.active,
             videoTracks: streamRef.current?.getVideoTracks().map(t => ({ enabled: t.enabled, readyState: t.readyState }))
           });
           
           console.log('▶️ 비디오 재생 시도...');
           videoElement.play().then(() => {
             console.log('🎮 비디오 재생 성공!');
             console.log('📊 최종 비디오 정보:', {
               videoWidth: videoElement.videoWidth,
               videoHeight: videoElement.videoHeight,
               readyState: videoElement.readyState,
               currentTime: videoElement.currentTime,
               duration: videoElement.duration,
               paused: videoElement.paused,
               ended: videoElement.ended
             });
             
             // 비디오가 실제로 재생되고 있는지 확인
             setTimeout(() => {
               console.log('🔍 재생 후 상태 확인:', {
                 currentTime: videoElement.currentTime,
                 paused: videoElement.paused,
                 readyState: videoElement.readyState
               });
             }, 1000);
           }).catch(playError => {
             // AbortError는 무시 (DOM에서 제거된 경우)
             if (playError.name === 'AbortError') {
               console.log('⚠️ 비디오 재생 중단됨 (DOM에서 제거됨)');
             } else {
               console.error('❌ 비디오 재생 실패:', playError);
             }
           });
        } else {
          console.error('❌ 비디오 요소를 찾을 수 없음');
        }
      }, 100); // 100ms 지연으로 React 렌더링 완료 대기

    } catch (err: unknown) {
      console.error('❌ 카메라 접근 실패:', err);
      setError((err as Error).message || '카메라에 접근할 수 없습니다.');
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 비디오 중지
  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    console.log('🔌 로컬 카메라 중지');
  }, []);

  // 비디오 토글 (스트림은 유지하고 비디오 트랙만 켜기/끄기)
  const toggleVideo = useCallback(async () => {
    console.log('🔄 toggleVideo 호출됨! 현재 상태:', { isVideoEnabled, hasStream: !!streamRef.current });
    
    if (!streamRef.current) {
      console.log('📹 스트림이 없어서 새로 시작');
      await startVideo();
      return;
    }

    const videoTrack = streamRef.current.getVideoTracks()[0];
    console.log('🎥 비디오 트랙 확인:', { hasVideoTrack: !!videoTrack, currentEnabled: videoTrack?.enabled });
    
    if (videoTrack) {
      const newEnabled = !isVideoEnabled;
      videoTrack.enabled = newEnabled;
      setIsVideoEnabled(newEnabled);
      
      console.log(newEnabled ? '📹 비디오 켜짐' : '📹 비디오 꺼짐');
      console.log('🔧 트랙 enabled 설정:', newEnabled, '실제 값:', videoTrack.enabled);
      
      // 비디오를 다시 켤 때 video 요소에 스트림 재연결
      if (newEnabled && videoRef.current) {
        console.log('🔌 비디오 요소에 스트림 재연결 시도...');
                 setTimeout(() => {
           if (videoRef.current && streamRef.current) {
             videoRef.current.srcObject = streamRef.current;
             videoRef.current.play().then(() => {
               console.log('✅ 비디오 재연결 및 재생 성공');
             }).catch(error => {
               if (error.name === 'AbortError') {
                 console.log('⚠️ 비디오 재연결 중단됨 (DOM에서 제거됨)');
               } else {
                 console.error('❌ 비디오 재생 실패:', error);
               }
             });
           }
         }, 50);
      }
    } else if (!isVideoEnabled) {
      console.log('📹 비디오 트랙이 없고 켜려고 함 - 새로 시작');
      await startVideo();
    } else {
      console.log('⚠️ 예상치 못한 상황: 비디오 트랙 없음, 현재 enabled:', isVideoEnabled);
    }
  }, [isVideoEnabled, startVideo]);

  // 오디오 토글 (음소거/해제)
  const toggleAudio = useCallback(async () => {
    console.log('🔄 toggleAudio 호출됨! 현재 상태:', { isAudioEnabled, hasStream: !!streamRef.current });
    
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      console.log('🎵 오디오 트랙 확인:', { count: audioTracks.length, tracks: audioTracks.map(t => ({ enabled: t.enabled, kind: t.kind })) });
      
      const newEnabled = !isAudioEnabled;
      audioTracks.forEach(track => {
        track.enabled = newEnabled;
      });
      setIsAudioEnabled(newEnabled);
      console.log(`🎤 마이크 ${newEnabled ? '활성화' : '비활성화'}`);
    } else {
      console.log('⚠️ 스트림이 없어서 오디오 토글 불가능');
    }
  }, [isAudioEnabled]);

    // 비디오 상태에 따른 video 요소 관리
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      
      if (isVideoEnabled && videoTrack?.enabled) {
        // 비디오가 켜져있으면 스트림 연결
        if (videoRef.current.srcObject !== streamRef.current) {
          console.log('🔌 비디오 상태 변경으로 스트림 연결:', isVideoEnabled);
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(error => {
            if (error.name === 'AbortError') {
              console.log('⚠️ 비디오 상태 변경 재생 중단됨 (DOM에서 제거됨)');
            } else {
              console.error('❌ 비디오 재생 실패:', error);
            }
          });
        }
      }
    }
  }, [isVideoEnabled]);

  // 모든 video 요소에 스트림 연결하는 함수
  const connectVideoElements = useCallback(() => {
    if (!streamRef.current || !isVideoEnabled) return;
    
    // 페이지의 모든 video 요소를 찾아서 스트림 연결
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((videoElement) => {
      if (videoElement.srcObject !== streamRef.current) {
        console.log('🔌 추가 비디오 요소에 스트림 연결');
        videoElement.srcObject = streamRef.current;
        videoElement.play().catch(error => {
          if (error.name === 'AbortError') {
            console.log('⚠️ 추가 비디오 요소 재생 중단됨');
          } else {
            console.error('❌ 추가 비디오 요소 재생 실패:', error);
          }
        });
      }
    });
  }, [isVideoEnabled]);

  // 비디오 상태 변경 시 모든 비디오 요소에 연결
  useEffect(() => {
    if (isVideoEnabled && streamRef.current) {
      // 약간의 지연 후 모든 비디오 요소에 연결
      setTimeout(connectVideoElements, 100);
    }
  }, [isVideoEnabled, connectVideoElements]);

  return {
    videoRef,
    isVideoEnabled,
    isAudioEnabled,
    isConnecting,
    error,
    startVideo,
    stopVideo,
    toggleVideo,
    toggleAudio,
    connectVideoElements,
  };
};