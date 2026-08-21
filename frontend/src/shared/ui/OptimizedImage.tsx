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