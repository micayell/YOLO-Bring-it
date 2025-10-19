import { useRef, useState, useEffect, useMemo } from 'react';

// 닉네임을 배지 PNG 위에 얹고, 텍스트 길이에 맞춰 가로폭을 자동으로 늘립니다.
// public/Badge.png 를 기본 배지로 사용합니다.
export function NicknameBadge({
  nickname,
  badgeSrc = "/Badge.png",   // public/Badge.png
  height = 64,               // 배지 높이(px)
  paddingX = 24,             // 좌우 패딩(px)
  maxWidth = 480,            // 최대 가로(px) - 길면 ... 처리
  fontSize = 28,             // 기본 글자 크기(px)
}: {
  nickname: string;
  badgeSrc?: string;
  height?: number;
  paddingX?: number;
  maxWidth?: number;
  fontSize?: number;
}) {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);

  // 텍스트 폭 측정해서 컨테이너 가로를 동적으로 조절
  useEffect(() => {
    if (!textRef.current) return;

    const measure = () => setTextWidth(textRef.current!.offsetWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(textRef.current);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [nickname, fontSize]);

  const width = Math.min(Math.ceil(textWidth + paddingX * 2), maxWidth);

  // 배지 높이에 따른 폰트 자동 스케일
  const scaledFont = useMemo(() => {
    const baseH = 64;
    const scale = height / baseH;
    return Math.max(14, Math.round(fontSize * scale));
  }, [height, fontSize]);

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width, height }}
      aria-label={`닉네임 배지: ${nickname}`}
      title={nickname}
    >
      {/* 배경 배지 이미지 */}
      <img
        src={badgeSrc}
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: "fill" }} // 가로로 자연스럽게 늘어나도록
      />

      {/* 닉네임 텍스트 */}
      <span
        ref={textRef}
        className="relative z-[1] whitespace-nowrap overflow-hidden text-ellipsis font-['BM_HANNA_TTF:Regular',_sans-serif]"
        style={{
          maxWidth: width - paddingX * 2,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          lineHeight: 1.1,
          fontSize: scaledFont,
          // 배지 색에 맞춰 살짝 강조
          textShadow: "0 0 8px rgba(0,0,0,0.25)",
          color: "#111", // 배지 위에서 잘 보이는 진한 색
        }}
      >
        {nickname}
      </span>
    </div>
  );
}
