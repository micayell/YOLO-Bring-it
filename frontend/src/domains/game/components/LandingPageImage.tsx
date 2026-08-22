// import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageImageProps {
  className?: string;
}

export function LandingPageImage({ className = '' }: LandingPageImageProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <img
        src="/landing-page-main.png"
        alt="YOLO Bring It! 메인 캐릭터들"
        className="w-full h-auto rounded-lg shadow-lg"
        style={{ 
          maxWidth: '600px',
          margin: '0 auto',
          display: 'block'
        }}
      />
      
      {/* 이미지 위에 오버레이 효과 */}
      {/* <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      /> */}
      

    </motion.div>
  );
} 