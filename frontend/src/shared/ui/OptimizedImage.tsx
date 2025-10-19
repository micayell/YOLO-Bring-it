// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { optimizeImage, OptimizedImage as OptimizedImageType, ImageOptimizationOptions } from '@/shared/utils/imageOptimizer';
// import { cn } from './utils';

// interface OptimizedImageProps {
//   src: string;
//   alt: string;
//   className?: string;
//   fallbackSrc?: string;
//   optimizationOptions?: ImageOptimizationOptions;
//   onLoad?: () => void;
//   onError?: () => void;
//   showLoading?: boolean;
//   showError?: boolean;
// }

// export const OptimizedImage: React.FC<OptimizedImageProps> = ({
//   src,
//   alt,
//   className,
//   fallbackSrc,
//   optimizationOptions = {},
//   onLoad,
//   onError,
//   showLoading = true,
//   showError = true,
// }) => {
//   const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
//   const [currentSrc, setCurrentSrc] = useState<string>(src);
//   const [optimizedImage, setOptimizedImage] = useState<OptimizedImageType | null>(null);

//   useEffect(() => {
//     // 이미지 최적화
//     const optimized = optimizeImage(src, optimizationOptions);
//     setOptimizedImage(optimized);
//   }, [src, optimizationOptions]);

//   const handleLoad = () => {
//     setImageState('loaded');
//     onLoad?.();
//   };

//   const handleError = () => {
//     if (fallbackSrc && currentSrc !== fallbackSrc) {
//       setCurrentSrc(fallbackSrc);
//       setImageState('loading');
//     } else {
//       setImageState('error');
//       onError?.();
//     }
//   };

//   const handleImageError = () => {
//     handleError();
//   };

//   return (
//     <div className={cn('relative overflow-hidden', className)}>
//       <AnimatePresence mode="wait">
//         {imageState === 'loading' && showLoading && (
//           <motion.div
//             key="loading"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
//           >
//             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//           </motion.div>
//         )}

//         {imageState === 'error' && showError && (
//           <motion.div
//             key="error"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 bg-gray-100 flex items-center justify-center"
//           >
//             <div className="text-center text-gray-500">
//               <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               <p className="text-sm">이미지를 불러올 수 없습니다</p>
//             </div>
//           </motion.div>
//         )}

//         {imageState !== 'error' && (
//           <motion.img
//             key="image"
//             src={currentSrc}
//             alt={alt}
//             className={cn('w-full h-full object-cover', className)}
//             loading={optimizedImage?.loading || 'lazy'}
//             srcSet={optimizedImage?.srcSet}
//             sizes={optimizedImage?.sizes}
//             onLoad={handleLoad}
//             onError={handleImageError}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: imageState === 'loaded' ? 1 : 0 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // 배경 이미지 컴포넌트
// interface BackgroundImageProps {
//   src: string;
//   className?: string;
//   fallbackSrc?: string;
//   children?: React.ReactNode;
// }

// export const BackgroundImage: React.FC<BackgroundImageProps> = ({
//   src,
//   className,
//   fallbackSrc,
//   children,
// }) => {
//   const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
//   const [currentSrc, setCurrentSrc] = useState<string>(src);

//   const handleLoad = () => {
//     setImageState('loaded');
//   };

//   const handleError = () => {
//     if (fallbackSrc && currentSrc !== fallbackSrc) {
//       setCurrentSrc(fallbackSrc);
//       setImageState('loading');
//     } else {
//       setImageState('error');
//     }
//   };

//   return (
//     <div className={cn('relative overflow-hidden', className)}>
//       <AnimatePresence mode="wait">
//         {imageState === 'loading' && (
//           <motion.div
//             key="loading"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 bg-gray-200 animate-pulse"
//           />
//         )}

//         {imageState !== 'error' && (
//           <motion.div
//             key="background"
//             className="absolute inset-0"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: imageState === 'loaded' ? 1 : 0 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//             style={{
//               backgroundImage: `url(${currentSrc})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               backgroundRepeat: 'no-repeat',
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {children && (
//         <div className="relative z-10">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// // 스프라이트 이미지 컴포넌트
// interface SpriteImageProps {
//   src: string;
//   frameWidth: number;
//   frameHeight: number;
//   frameIndex: number;
//   totalFrames: number;
//   className?: string;
//   animationSpeed?: number;
//   loop?: boolean;
// }

// export const SpriteImage: React.FC<SpriteImageProps> = ({
//   src,
//   frameWidth,
//   frameHeight,
//   frameIndex,
//   totalFrames,
//   className,
//   animationSpeed = 100,
//   loop = true,
// }) => {
//   const [currentFrame, setCurrentFrame] = useState(frameIndex);

//   useEffect(() => {
//     if (loop) {
//       const interval = setInterval(() => {
//         setCurrentFrame((prev) => (prev + 1) % totalFrames);
//       }, animationSpeed);

//       return () => clearInterval(interval);
//     }
//   }, [loop, totalFrames, animationSpeed]);

//   const backgroundPosition = `-${currentFrame * frameWidth}px 0`;

//   return (
//     <div
//       className={cn('inline-block', className)}
//       style={{
//         width: frameWidth,
//         height: frameHeight,
//         backgroundImage: `url(${src})`,
//         backgroundPosition,
//         backgroundRepeat: 'no-repeat',
//       }}
//     />
//   );
// }; 

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  optimizeImage,
  OptimizedImage as OptimizedImageType,
  ImageOptimizationOptions,
} from '@/shared/utils/imageOptimizer';
import { cn } from './utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  optimizationOptions?: ImageOptimizationOptions;
  onLoad?: () => void;
  onError?: () => void;
  showLoading?: boolean;
  showError?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  optimizationOptions = {},
  onLoad,
  onError,
  showLoading = true,
  showError = true,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [optimizedImage, setOptimizedImage] = useState<OptimizedImageType | null>(null);

  useEffect(() => {
    // 🔧 변경됨: JSON.stringify 로 최적화하여 무한 렌더링 방지
    const optimized = optimizeImage(src, optimizationOptions);
    setOptimizedImage(optimized);
  }, [src, JSON.stringify(optimizationOptions)]); // 🔧 변경됨

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  };

  const handleImageError = () => {
    handleError();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        {imageState === 'loading' && showLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {imageState === 'error' && showError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">이미지를 불러올 수 없습니다</p>
            </div>
          </motion.div>
        )}

        {imageState !== 'error' && (
          <motion.img
            key="image"
            src={currentSrc}
            alt={alt}
            className={cn('w-full h-full object-cover', className)}
            loading={optimizedImage?.loading || 'lazy'}
            srcSet={optimizedImage?.srcSet}
            sizes={optimizedImage?.sizes}
            onLoad={handleLoad}
            onError={handleImageError}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageState === 'loaded' ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};