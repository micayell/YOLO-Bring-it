import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function useIsMobile(): boolean {
    const { width } = useWindowSize();
    return width < 768;
}

export function useIsTablet(): boolean {
    const { width } = useWindowSize();
    return width >= 768 && width < 1280;
}

export function useIsPortrait(): boolean {
    const { width, height } = useWindowSize();
    return height > width;
}
